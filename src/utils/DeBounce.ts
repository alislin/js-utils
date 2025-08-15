/*
 * @Author: Lin Ya
 * @Date: 2023-08-18 11:29:47
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-08-15 11:55:32
 * @Description: 调用防抖
 */
/**
 * 调用防抖
 * @param fn 调用方法
 * @param delay 延迟时间（毫秒），默认：1000
 * @returns 
 */
export function debounce<Args extends any[]>(fn: (...args: Args) => void, delay?: number) {
    // 1.定义一个定时器, 保存上一次的定时器
    let timer: NodeJS.Timeout;


    let delayCount = delay ?? 1000;

    // 2.真正执行的函数
    const _debounce = function (...args: Args) {
        // 取消上一次的定时器
        clearTimeout(timer)
        // 延迟执行
        timer = setTimeout(() => {
            // 外部传入的真正要执行的函数
            fn(...args);
        }, delayCount)
    }

    return _debounce
}

