/*
 * @Author: Lin Ya
 * @Date: 2024-07-16 16:44:31
 * @LastEditors: Lin Ya
 * @LastEditTime: 2024-07-17 09:30:50
 * @Description: 时间计算
 */

import { isNumber } from "./StringHelper";

/**
 * 计算平均值
 * @example
 * // 基本用法
 * const average = new Average();
 * average.add(5);
 * average.add(10);
 * console.log(average.value()); // 输出7.5
 * 
 * // 使用平滑平均值
 * const smoothAverage = new Average(5);
 * smoothAverage.add(2);
 * smoothAverage.add(4);
 * smoothAverage.add(6);
 * console.log(smoothAverage.smoothValue()); // 输出平均值
 */
export class Average {
    private items: number[] = [];
    private aveItems: number[] = [];
    private ave = 0;
    private aveSmooth = 0;
    private count = 10;
    /**
     * 构造函数
     * @param count 设置队列长度（默认为10）
     * @example
     * // 创建长度为5的平均值计算器
     * const average = new Average(5);
     */
    constructor(count?: number) {
        this.count = count ?? 10;
        this.count = this.count > 0 ? this.count : 10;
    }

    /**
     * 加入数值到计算队列
     * @param n 加入的数值
     * @example
     * const average = new Average();
     * average.add(10);
     * average.add(20);
     */
    public add(n: number) {
        if (!isNumber(n)) {
            throw ("无效的参数，需要传入数值");
        }
        this.items.push(+n);
        if (this.items.length > this.count) {
            this.items.shift();
        }
        this.ave = this.calc(this.items);
        this.aveAdd(this.ave);
        this.aveSmooth = this.calc(this.aveItems);
    }

    /**
     * 获取当前平均值
     * @returns 当前队列中数值的平均值
     * @example
     * const average = new Average();
     * average.add(5);
     * average.add(15);
     * const result = average.value(); // 返回10
     */
    public value() {
        return this.ave;
    }

    /**
     * 获取平滑平均值（基于平均值的平均值）
     * @returns 平滑后的平均值
     * @example
     * const average = new Average();
     * average.add(10);
     * average.add(20);
     * average.add(30);
     * const smooth = average.smoothValue();
     */
    public smoothValue() {
        return this.aveSmooth;
    }

    private calc(items: number[]) {
        if (items.length === 0) return 0;

        let m = 0;
        items.forEach(x => m += x);
        const ave = m / items.length;
        return ave;
    }

    private aveAdd(n: number) {
        this.aveItems.push(n);
        if (this.aveItems.length > this.count) {
            this.aveItems.shift();
        }
    }
}