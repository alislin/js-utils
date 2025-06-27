/*
 * @Author: Lin Ya
 * @Date: 2022-11-03 17:28:19
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-06-27 15:51:56
 * @Description: list 方法
 */

import { areObjectEqual } from "./ObjectHelper";


/**
 * 获取列表第一条记录或者是空值
 * @param list 
 * @returns 默认值(第一条记录或者是空值)
 */
export function getDefault<T>(list?: T[] | string) {
    if (!list) return undefined;

    if (Array.isArray(list)) {

        if (list.length > 0) return list[0];
        return undefined;
    }

    return <unknown>list as T;
}

/**
 * 返回列表（确保列表）
 * @param list 
 * @returns 列表
 */
export function getList<T>(list?: T[]) {
    if (Array.isArray(list)) {
        return list;
    }
    if (list === undefined) {
        return [];
    }
    return [list];
}

/** 分组方法 */
export type MapValuesToKeysIfAllowed<T> = {
    [K in keyof T]: T[K] extends PropertyKey ? K : never;
};
type Filter<T> = MapValuesToKeysIfAllowed<T>[keyof T];

export function groupBy<T extends Record<PropertyKey, any>, Key extends Filter<T>>(
    arr: T[],
    key: Key
): Record<T[Key], T[]> {
    return arr.reduce((accumulator, val) => {
        const groupedKey = val[key];
        if (!accumulator[groupedKey]) {
            accumulator[groupedKey] = [];
        }
        accumulator[groupedKey].push(val);
        return accumulator;
    }, {} as Record<T[Key], T[]>);
}

export function groupByFunc<
    RetType extends PropertyKey,
    T, // no longer need any requirements on T since the grouper can do w/e it wants
    Func extends (arg: T) => RetType
>(arr: T[], mapper: Func): Record<RetType, T[]> {
    return arr.reduce((accumulator, val) => {
        const groupedKey = mapper(val);
        if (!accumulator[groupedKey]) {
            accumulator[groupedKey] = [];
        }
        accumulator[groupedKey].push(val);
        return accumulator;
    }, {} as Record<RetType, T[]>);
}

export function listSum<T>(list: T[], func: (item: T) => number) {
    let result = 0;
    list.forEach(x => result += Number(func(x)));
    return result;
}

/**
 * 获取组合数队列(指定元素数量)
 * @param list 
 * @param func 
 * @param targetSum 
 * @param size 队列元素个数（必须相等）
 * @returns 
 */
export function listGroupSum<T>(list: T[], func: (item: T) => number, targetSum: number, size: number) {
    const combinations = getCombinations(list, size);
    const filteredCombinations = combinations.filter(combination => listSum(combination, func) === targetSum);
    return filteredCombinations;
}

/**
 * 获取组合数队列(返回第一个满足条件的队列)
 * @param list 
 * @param func 
 * @param targetSum 
 * @param size 队列元素个数（小于等于）
 */
export function listGroupSumFirst<T>(list: T[], func: (item: T) => number, targetSum: number, size: number) {
    for (let i = 1; i <= size; i++) {
        const item = listGroupSum(list, func, targetSum, i);
        if (item.length > 0) {
            const list = item[0];
            return list;
        }
    }
}

/**
 * 获取组合数队列(返回所有满足条件的队列)
 * @param list 
 * @param func 
 * @param targetSum 
 * @param size 队列元素个数（小于等于）
 */
export function listGroupSumAll<T>(list: T[], func: (item: T) => number, targetSum: number, size: number) {
    const result = [] as T[][];
    for (let i = 1; i <= size; i++) {
        const item = listGroupSum(list, func, targetSum, i);
        if (item.length > 0) {
            result.push(...item);
        }
    }
    return result;
}

/**
 * 获取列表组合
 * @param array 
 * @param size 
 * @returns 
 */
export function getCombinations<T>(array: T[], size: number) {
    const combinations: T[][] = [];
    function nextCombination(index: number, combination: T[]) {
        if (combination.length === size) {
            combinations.push(combination);
            return;
        }
        for (let i = index; i < array.length; i++) {
            nextCombination(i + 1, combination.concat(array[i]));
        }
    }
    nextCombination(0, []);
    return combinations;
}

/**
 * 列表分页执行
 * @param array 对象列表
 * @param handler 分页处理方法
 * @param pageSize 分页数
 * @returns 
 */
export async function listPageAction<T>(array: T[], handler: (item: T[], startIndex: number) => void, pageSize: number = 100) {
    if (!array || array.length === 0) return;

    const list = [] as T[];
    list.push(...array);

    const taskCount = 100;
    const count = pageSize > 0 ? pageSize : taskCount;
    const max = list.length;
    for (let i = 0; i < max; i += count) {
        const items = list.splice(0, count);
        await handler(items, i);
    }
}

/**
 * 将列表连接为字符串输出
 * @param array 
 * @param joinString 连接字符串
 * @param prop 获取字串属性
 * @returns 连接字符串
 */
export function listJoin<T>(array: T[], joinString: string, prop: (item: T) => string | undefined) {
    let m = "";
    for (let i = 0; i < array.length; i++) {
        const item = array[i];
        if (i > 0) m += joinString;
        m += prop(item);
    }
    return m;
}

/**
 * 比较两个列表的指定属性是否相等
 * @param a 
 * @param b 
 * @param prop 要比较的属性
 */
export function listEqual<T>(a: T[], b: T[], prop: (item: T) => string): boolean {
    if (a.length !== b.length) return false;
    const al = a.map(x => prop(x));
    const bl = b.map(x => prop(x));
    const ral = al.filter(x => !bl.includes(x));
    if (ral.length > 0) return false;
    const rbl = bl.filter(x => !al.includes(x));
    if (rbl.length > 0) return false;
    return true;
}

/**
 * 获取列表中的唯一记录
 * @param list 要处理的数组
 * @param prop 可选，用于确定唯一性的属性获取函数。如果未提供，则将元素本身作为唯一值
 * @returns 去重后的数组
 * @example
 * // 基本用法
 * listDistinct([1, 2, 2, 3]); // 返回 [1, 2, 3]
 * 
 * // 使用对象数组
 * const users = [
 *   { id: 1, name: 'Alice' },
 *   { id: 2, name: 'Bob' },
 *   { id: 1, name: 'Alice' }
 * ];
 * listDistinct(users, user => user.id); 
 * // 返回 [
 * //   { id: 1, name: 'Alice' },
 * //   { id: 2, name: 'Bob' }
 * // ]
 */
export function listDistinct<T>(list: T[], prop?: (item: T) => string) {
    // 如果有prop函数，使用字符串键比对
    if (prop) {
        const seen = new Set<string>();
        return list.filter(item => {
            const key = prop(item);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
    
    // 否则使用深度对象比较
    return list.filter((item, index, self) => 
        self.findIndex(i => areObjectEqual(i, item)) === index
    );
}

/**
 * 嵌套子列表转换为平铺列表
 * @param list 源列表
 * @param children 子队列
 * @param filter 过滤器
 */
export function listFlat<T>(node: T, children: (item: T) => T[], filter?: (item: T) => boolean): T[] {
    const result: T[] = [];
    if (filter && filter(node)) result.push(node);
    result.push(...listFlats(children(node), children, filter));
    return result;
}

export function listFlats<T>(list: T[], children: (item: T) => T[], filter?: (item: T) => boolean): T[] {
    const result: T[] = [];
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        result.push(...listFlat(item, children, filter));
    }
    return result;
}

/**
 * 分页加载所有数据
 * @param firstPage 初始页码
 * @param load 加载方法
 * @param getTotalPages 获取总页数方法
 * @param getItems 获取结果列表方法
 * @returns 
 */
export async function loadByPage<TResult, Response>(
    /** 开始页码 */
    firstPage: number,
    /** 加载方法 */
    load: (page: number) => Promise<Response>,
    /** 获取总页数方法 */
    getTotalPages: (resp: Response) => number,
    /** 获取结果列表方法 */
    getItems: (resp: Response) => TResult[]
) {
    const list = [] as TResult[];
    const first_resp = await load(firstPage);
    if (!first_resp) return [];

    list.push(...getItems(first_resp));
    const total = getTotalPages(first_resp);
    if (total > firstPage) {
        for (let i = firstPage + 1; i < total; i++) {
            const resp = await load(i);
            if (!resp) {
                break;
            }
            list.push(...getItems(resp));
        }
    }

    return list;
}

/**
 * 从键值列表生成对象
 * @param keys 键值列表
 * @returns 对象
 */
export function listToObject(keys: { key: string, value: any }[]): { [key: string]: any } {
    const result: { [key: string]: any } = {};
    keys.forEach((item, index) => {
        result[item.key] = item.value;
    });
    return result;
}

/**
 * 获取列表交集
 * @param list1 
 * @param list2 
 * @param equals 相等计算方法
 * @returns 两个列表的交集
 */
export function intersect<T>(list1: T[], list2: T[], equals?: (x: T, y: T) => boolean) {
    if (!list1 || !list2) return [];

    let result = list1.filter(x => {
        let count = list2.filter(y => {
            if (equals) {
                if (equals(x, y)) {
                    return true;
                }
                return false;
            }
            else {
                return areObjectEqual(x, y);
            }
        }).length
        return count > 0;
    });
    return result;
}