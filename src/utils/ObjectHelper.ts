/*
 * @Author: Lin Ya
 * @Date: 2025-06-25 09:26:01
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-06-27 08:48:09
 * @Description: 
 */

/**
 * 深度比较两个对象或值是否相等
 * @param query1 第一个要比较的对象或值
 * @param query2 第二个要比较的对象或值
 * @param opt 比较选项
 * @param opt.excludeKeys 要排除比较的键名数组，默认不排除
 * @param opt.strictNull 是否严格比较null和undefined，false时视null和undefined为相等(默认)
 * @returns 如果两个对象或值相等则返回true，否则返回false
 * @example
 * // 基本使用
 * areObjectEqual({a: 1}, {a: 1}); // true
 * 
 * // 排除特定键比较
 * areObjectEqual({a: 1, page: 2}, {a: 1, page: 3}, {excludeKeys: ['page']}); // true
 * 
 * // null和undefined比较
 * areObjectEqual({a: null}, {a: undefined}); // true
 * areObjectEqual({a: null}, {a: undefined}, {strictNull: true}); // false
 * 
 * // 嵌套对象比较
 * areObjectEqual({a: {b: 1}}, {a: {b: 1}}); // true
 */
export function areObjectEqual(query1: any, query2: any, opt?: { excludeKeys?: string[], strictNull?: boolean }): boolean {
    const excludeKeys = opt?.excludeKeys ?? [];
    // 是否严格比较 null 和 undefined ，默认为false, null=undefined
    const strictNull = opt?.strictNull ?? false;
    // 如果两个值严格相等，直接返回true
    if ((query1 === query2)) return true;

    // 如果其中一个是null或undefined，另一个不是，返回false
    if (query1 == null || query2 == null) {
        return query1 === query2;
    }

    // 处理基本类型
    if (typeof query1 !== 'object' || typeof query2 !== 'object') {
        return query1 === query2;
    }

    // 获取两个对象的所有键（包括原型链上的键），并过滤掉要排除的键
    const allKeys = new Set([
        ...Object.keys(query1),
        ...Object.keys(query2)
    ].filter(key => !excludeKeys.includes(key)));

    // 检查所有键
    for (const key of allKeys) {
        const val1 = query1[key];
        const val2 = query2[key];

        // 特殊处理undefined值
        if (val1 === undefined && val2 === undefined || (val1 === null && val2 === null)) {
            continue;
        }
        if (val1 === undefined && !(key in query2)) {
            continue;
        }
        if (val2 === undefined && !(key in query1)) {
            continue;
        }

        // 如果一边是undefined/null，另一边不是
        if ((val1 === undefined || val1 === null) && (val2 === undefined || val2 === null)) {
            if (strictNull) return false;

            continue;
        }


        // 递归比较值
        if (!areObjectEqual(val1, val2, { excludeKeys, strictNull })) {
            return false;
        }
    }

    return true;
}

/**
 * 检查对象是否相等
 */
export function objectEqual() {
    let orgData: string = "";

    /**
     * 仅检查是否相等
     * @param data 比较对象
     * @returns 
     */
    function checkOnly(data: any, org_data?: any) {
        if (org_data) {
            orgData = JSON.stringify(org_data);
        }
        const m = JSON.stringify(data);
        const result = orgData === m;
        if (result) return true;
        return false;
    }

    /**
     * 检查是否相等，并将新对象记录下来
     * @param data 比较对象
     * @returns 
     */
    function check(data: any) {
        const m = JSON.stringify(data);
        const result = orgData === m;
        if (result) return true;
        orgData = m;
        return false;
    }

    return { check, checkOnly };
}

/**
 * 完全复制对象(创建新对象)
 * @param obj 
 * @returns 复制的对象
 */
export function clone<T>(obj: T) {
    if (!obj || obj === null) {
        return {} as T;
    }
    let temp = JSON.stringify(obj);
    return JSON.parse(temp) as T;
}
