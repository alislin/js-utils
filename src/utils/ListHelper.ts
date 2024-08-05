/*
 * @Author: Lin Ya
 * @Date: 2022-11-03 17:28:19
 * @LastEditors: Lin Ya
 * @LastEditTime: 2024-05-23 12:08:16
 * @Description: list 方法
 */

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
 * @param list
 * @param prop 作为唯一值属性
 */
export function listDistinct<T>(list: T[], prop: (item: T) => string) {
    const keyList = list.map(prop);
    const result = list.filter((x, i) => onlyUnique(prop(x), i, keyList));
    return result;

    function onlyUnique<T>(value: string, index: number, array: string[]) {
        return array.indexOf(value) === index;
    }
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