/*
 * @Author: Lin Ya
 * @Date: 2022-10-16 16:43:53
 * @LastEditors: Lin Ya
 * @LastEditTime: 2024-07-17 15:06:31
 * @Description: 分页加载组件
 */

import { Task } from "./TaskHelper";

export class PageLoad<TItem> {
    private loading = false;
    private stopCount = 0;
    private stopCountLimit = 10;
    private firstPage = 1;
    // private taskCount = 1;

    public stopPageLoad = false;
    public key: string = "";
    private pageKey: string = "";

    /** 当分页加载开始时 */
    public onStart = () => { };
    /** 当获取到数据时 */
    public onLoad: (retItems: PageLoadResult<TItem>) => void = x => { };
    /** 当加载完成时 */
    public onFinished: () => void = () => { };

    // constructor(taskCount?: number) {
    //     this.taskCount = taskCount ?? this.taskCount;
    //     this.taskCount = this.taskCount > 0 ? this.taskCount : 1;
    // }

    /** 开始加载 */
    public async load<T>(option: PageLoadOption<T, TItem>) {
        if (this.stopCount >= this.stopCountLimit) {
            console.warn("达到最大计数，强制中止。");
            this.loading = false;
        }
        if (this.loading) {
            console.warn("中止加载过程，等待新的加载……");
            const interval = setInterval(() => {
                if (this.stopCount >= this.stopCountLimit) {
                    console.warn("达到最大计数，强制中止。");
                    this.loading = false;
                    clearInterval(interval);
                    return;
                }
                this.stopCount++;
                this.stopPageLoad = true;
            }, 1000);
            return;
        }


        if (this.key === option.key) {
            return;
        }
        this.key = option.key;

        let pageStart = option.pageStart ?? this.firstPage;
        this.onStart();
        this.stopPageLoad = false;
        this.stopCount = 0;
        this.loading = true;
        const size_point = option.loadSize;    // 分页加载切换点
        let size = option.size ?? 10;
        let total_p = 0;
        let page = option.page ?? pageStart;
        let startIndex = (page - pageStart) * size;
        let page_load_total = size / size_point;
        let size_load = size;

        // 检查查询条件是否变化
        const pageKey_new = JSON.stringify(option.getQueryOption(1, 10));
        if (pageKey_new !== this.pageKey) {
            this.pageKey = pageKey_new;
            page = pageStart;
            console.warn("查询条件变化，分页索引重置。");
        }

        let pageLoadPos = pageStart;

        if (size > size_point) {
            // 重新计算分页和起始页
            size_load = size_point;
            page = (page_load_total * (page - pageStart)) + pageStart;
        }

        let req = option.getQueryOption(page, size_load);

        let result = await option.query(req);
        total_p = result.total;

        // 检测是否最后一页
        if (startIndex + size > total_p) {
            page_load_total = (total_p - startIndex) / size_point;
        }

        result.current = 1 * 100 / page_load_total;
        result.current = result.current > 100 ? 100 : result.current;
        result.current = Number(result.current.toFixed(1));
        result.startIndex = startIndex;
        if (page === pageStart) result.page = page;
        this.onLoad(result);

        // const task = new Task<PageLoadResult<TItem>>(this.taskCount);
        // task.onTaskDone((time, result, data) => {
        //     console.log("page loaded:", data);

        //     if (!result) return;
        //     if (result.items.length === 0) {
        //         return;
        //     }
        //     result.current = Number(pageLoadPos.toFixed(1));
        //     result.startIndex = startIndex;
        //     if (page === pageStart) result.page = page;
        //     this.onLoad(result);
        // })

        for (let i = 1; i < page_load_total; i++) {
            this.loading = true;
            pageLoadPos = (i + pageStart) * 100 / page_load_total;
            if (this.stopPageLoad) {
                break;
            }
            // (async (index: number) => {
            //     const opt = { ...await option.getQueryOption(page + index, size_load) };
            //     task.run(() => option.query(opt), page + index);
            // })(i);
            // console.log("++++", i);

            req = option.getQueryOption(page + i, size_load)
            result = await option.query(req);

            if (result.items.length === 0) {
                break;
            }
            result.current = Number(pageLoadPos.toFixed(1));
            result.startIndex = startIndex;
            if (page === pageStart) result.page = page;
            this.onLoad(result);
        }
        // task.wait();
        this.loading = false;
        this.onFinished();
    }

    private pageReset<T>(opt: T) {

    }

}

export interface PageLoadOption<T, V> {
    key: string;
    page?: number;
    size?: number;
    /** 第一页索引（默认：1） */
    pageStart?: number;
    loadSize: number;
    getQueryOption: (page: number, size: number) => T;
    query: (opt: T) => Promise<PageLoadResult<V>>;
}

export interface PageLoadResult<T> {
    items: T[];
    /** 总记录数 */
    total: number;
    /** 当前进度（0-100） */
    current?: number;
    /** 开始索引 */
    startIndex?: number;
    // 查询条件变化重置页码（为空时，查询条件未变化）
    page?: number;
}