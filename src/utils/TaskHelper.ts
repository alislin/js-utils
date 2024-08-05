/*
 * @Author: Lin Ya
 * @Date: 2024-07-16 11:25:43
 * @LastEditors: Lin Ya
 * @LastEditTime: 2024-07-26 10:44:08
 * @Description: 任务助手
 */

import { Average } from "./Average";

export class Task<T> {
    private eventTask: "onTaskDone" = "onTaskDone";
    private listeners: { [event: string]: EventListener<T>[] } = {};
    private cur_id = 0;
    private maxCount: number = 3;
    private taskCount: number = 0;
    private act_list: { id: number, action: () => Promise<T>, data?: any }[] = [];
    private timeCalc: RemainTime = { process: 0, remain: 0 } as RemainTime;

    private taskStartTime = Date.now();
    private taskStarted = false;
    private taskDoneCount = 0;
    private taskProcessTimes: number[] = [];
    private taskAve = new Average();

    constructor(count: number = 3) {
        this.maxCount = count;
        this.maxCount = this.maxCount > 0 ? this.maxCount : 3;
    }

    /**
     * 加入执行线程
     * @param action 调用方法
     */
    public run(action: () => Promise<T>, data?: any) {
        if (!this.taskStarted) {
            this.timeReset();
            // this.taskStartTime = Date.now();
            // this.taskDoneCount = 0;
            // this.taskProcessTimes = [];
            // this.taskStarted = true;
        }
        if (!action) return;

        this.cur_id++;
        this.act_list.push({ id: this.cur_id, action, data });

        this.start();
        // console.log("id:", this.cur_id, " data:", data);

    }


    /**
     * 等待执行完成
     */
    public async wait() {
        return new Promise<void>((resolve) => {
            if (this.act_list.length === 0 && this.taskCount == 0) {
                resolve();
            }
            else {
                const interval = setInterval(() => {
                    if (this.act_list.length === 0 && this.taskCount == 0) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            }
        });
    }

    public stop() {
        this.act_list = [];
    }

    public timeReset() {
        this.taskStartTime = Date.now();
        this.taskDoneCount = 0;
        this.taskProcessTimes = [];
        this.taskStarted = true;
    }

    public onTaskDone(callback: EventListener<T>) {
        if (!this.listeners[this.eventTask]) {
            this.listeners[this.eventTask] = [];
        }
        this.listeners[this.eventTask].push(callback);
    }

    private async start() {
        if (this.taskCount >= this.maxCount) {
            return;
        }

        if (this.act_list.length == 0) {
            return;
        }

        while (this.act_list.length > 0) {
            if (this.taskCount >= this.maxCount) {
                await this.waitTime(10);
                continue;
            }

            const item = this.act_list.shift();
            this.taskCount++;
            try {
                const st = Date.now();
                const result = await item!.action();
                const dur = Date.now() - st;
                this.taskAve.add(dur);
                this.taskDoneCount++;
                this.taskProcessTimes.push(dur);
                this.dispatch(result, item?.data);

            } catch (err) {

            } finally {
                this.taskCount--;
                // console.log("finish:", this.taskCount, this.act_list.length);
            }
        }
    }

    private dispatch(result: T, data?: any) {
        if (this.listeners[this.eventTask]) {
            const ave = this.taskAve.smoothValue() / this.maxCount;
            const time = {
                process: ave,
                remain: this.act_list.length * (ave),
                remainCount: this.act_list.length,
                processCount: this.taskDoneCount,
            };
            this.listeners[this.eventTask].forEach(callback => callback(time, result, data));
        }
    }

    private async waitTime(n: number) {
        await new Promise(resolve => setTimeout(resolve, n));
    }
}

/**
 * 等待状态完成
 * @param ms 检查间隔时间（毫秒）
 * @param returnFlag 检查方法
 * @returns 
 */
export async function wait(ms: number, returnFlag: () => boolean) {
    return new Promise<void>((resolve) => {
        if (returnFlag()) {
            resolve();
        }
        else {
            const interval = setInterval(() => {
                if (returnFlag()) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        }
    });
}

interface EventListener<T> {
    (time: RemainTime, result?: T, data?: any): void;
}

export interface RemainTime {
    /** 单条记录处理时长（毫秒） */
    process: number;
    /** 任务剩余时长（毫秒） */
    remain: number;
    /** 队列剩余数量 */
    remainCount: number;
    /** 已处理任务数 */
    processCount: number;
}

