/*
 * @Author: Lin Ya
 * @Date: 2023-10-09 15:42:13
 * @LastEditors: Lin Ya
 * @LastEditTime: 2023-10-09 15:57:57
 * @Description: 事件类
 */
export class Events<T> {
    private listeners: ((args: T) => void)[] = [];

    public addListener(listener: (args: T) => void): void {
        this.listeners.push(listener);
    }

    public removeListener(listener: (args: T) => void): void {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    public trigger(args: T): void {
        this.listeners.forEach(l => l(args));
    }
}
