/*
 * @Author: Lin Ya
 * @Date: 2024-07-16 16:44:31
 * @LastEditors: Lin Ya
 * @LastEditTime: 2024-07-17 09:30:50
 * @Description: 时间计算
 */
/**
 * 计算平均值
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
     */
    constructor(count?: number) {
        this.count = count ?? 10;
        this.count = this.count > 0 ? this.count : 10;
    }

    /**
     * 加入
     * @param n 加入的数值
     */
    public add(n: number) {
        this.items.push(n);
        if (this.items.length > this.count) {
            this.items.shift();
        }
        this.ave = this.calc(this.items);
        this.aveAdd(this.ave);
        this.aveSmooth = this.calc(this.aveItems);
    }

    /**
     * 获取平均值
     * @returns 平均值
     */
    public value() {
        return this.ave;
    }

    /**
     * 获取平滑平均值
     * @returns 平均值
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