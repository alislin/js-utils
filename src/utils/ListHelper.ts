/*
 * @Author: Lin Ya
 * @Date: 2022-11-03 17:28:19
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-07-11 10:39:36
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
/**
 * 将对象的值映射到键（如果值允许作为属性键）
 * @template T 原始对象类型
 */
export type MapValuesToKeysIfAllowed<T> = {
    [K in keyof T]: T[K] extends PropertyKey ? K : never;
};
/**
 * 过滤出可用作属性键的值类型
 * @template T 原始对象类型
 */
type Filter<T> = MapValuesToKeysIfAllowed<T>[keyof T];

/**
 * 按照对象中指定的键进行分组
 * @template T 数组元素类型（必须是记录类型）
 * @template Key 用于分组的键（必须是T中值可作为属性键的键）
 * @param {T[]} arr 要分组的数组
 * @param {Key} key 分组的键
 * @returns {Record<T[Key], T[]>} 分组后的对象
 * 
 * @example
 * const arr = [
 *   { name: 'Alice', age: 20 },
 *   { name: 'Bob', age: 20 },
 *   { name: 'Charlie', age: 30 }
 * ];
 * 
 * // 按age分组
 * const grouped = groupBy(arr, 'age');
 * // 结果: {
 * //   '20': [{ name: 'Alice', age: 20 }, { name: 'Bob', age: 20 }],
 * //   '30': [{ name: 'Charlie', age: 30 }]
 * // }
 */
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

/**
 * 使用自定义函数对数组进行分组
 * @template RetType 分组键的类型（必须是属性键类型）
 * @template T 数组元素类型
 * @template Func 分组函数类型
 * @param {T[]} arr 要分组的数组
 * @param {Func} mapper 生成分组键的函数
 * @returns {Record<RetType, T[]>} 分组后的对象
 * 
 * @example
 * const arr = [
 *   { name: 'Alice', age: 20 },
 *   { name: 'Bob', age: 25 },
 *   { name: 'Charlie', age: 30 }
 * ];
 * 
 * // 按年龄段分组
 * const grouped = groupByFunc(arr, (item) => {
 *   if (item.age < 20) return 'young';
 *   if (item.age < 30) return 'adult';
 *   return 'senior';
 * });
 * // 结果: {
 * //   'adult': [{ name: 'Alice', age: 20 }, { name: 'Bob', age: 25 }],
 * //   'senior': [{ name: 'Charlie', age: 30 }]
 * // }
 */
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

/**
 * 计算列表中所有元素经过指定函数转换后的数值总和
 * @param list 要计算的列表
 * @param func 转换函数，将列表元素转换为数值
 * @returns 转换后数值的总和
 * @example
 * const list = [{value: 1}, {value: 2}, {value: 3}];
 * const sum = listSum(list, item => item.value); // 返回6
 */
export function listSum<T>(list: T[], func: (item: T) => number) {
    let result = 0;
    list.forEach(x => result += Number(func(x)));
    return result;
}

/**
 * 获取列表中指定元素数量的组合，这些组合的元素经过转换后的总和等于目标值
 * @param list 源列表
 * @param func 转换函数，将列表元素转换为数值
 * @param targetSum 目标总和
 * @param size 组合中元素的数量
 * @returns 满足条件的组合数组
 * @example
 * const list = [1, 2, 3, 4, 5];
 * const groups = listGroupSum(list, x => x, 5, 2); 
 * // 返回[[1,4], [2,3]]
 */
export function listGroupSum<T>(list: T[], func: (item: T) => number, targetSum: number, size: number) {
    const combinations = getCombinations(list, size);
    const filteredCombinations = combinations.filter(combination => listSum(combination, func) === targetSum);
    return filteredCombinations;
}

/**
 * 获取列表中第一个满足条件的组合，组合的元素经过转换后的总和等于目标值
 * 会从1个元素开始尝试，直到指定最大数量
 * @param list 源列表
 * @param func 转换函数，将列表元素转换为数值
 * @param targetSum 目标总和
 * @param size 组合中元素的最大数量
 * @returns 第一个满足条件的组合，如果没有则返回undefined
 * @example
 * const list = [1, 2, 3, 4, 5];
 * const group = listGroupSumFirst(list, x => x, 5, 3);
 * // 返回[5]，因为单个元素5就满足条件
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
 * 获取列表中所有满足条件的组合，组合的元素经过转换后的总和等于目标值
 * 包含从1个元素到指定最大数量的所有可能组合
 * @param list 源列表
 * @param func 转换函数，将列表元素转换为数值
 * @param targetSum 目标总和
 * @param size 组合中元素的最大数量
 * @returns 所有满足条件的组合数组
 * @example
 * const list = [1, 2, 3, 4, 5];
 * const groups = listGroupSumAll(list, x => x, 5, 3);
 * // 返回[[5], [1,4], [2,3]]
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
 * 获取数组中指定大小的所有组合
 * @param array 源数组
 * @param size 组合大小
 * @returns 所有可能的组合数组
 * @example
 * const array = [1, 2, 3];
 * const combos = getCombinations(array, 2);
 * // 返回[[1,2], [1,3], [2,3]]
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
 * @description 将一个大数组按指定大小分页，并对每页数据执行异步处理
 * @param {T[]} array 要处理的对象列表
 * @param {(item: T[], startIndex: number) => void} handler 分页处理方法，接收当前页数据列表和起始索引
 * @param {number} [pageSize=100] 每页数据量，默认为100
 * @returns {Promise<void>} 无返回值
 * @example
 * // 示例1：基本用法
 * const data = Array.from({length: 250}, (_, i) => ({id: i}));
 * await listPageAction(data, async (page, startIndex) => {
 *   console.log(`处理第${startIndex}-${startIndex + page.length}条数据`);
 *   await processPage(page); // 假设的异步处理函数
 * }, 50);
 * 
 * @example
 * // 示例2：使用默认分页大小
 * await listPageAction(largeArray, async (page) => {
 *   await saveToDatabase(page); // 批量保存到数据库
 * });
 */
export async function listPageAction<T>(array: T[], handler: (item: T[], startIndex: number) => void, pageSize: number = 100): Promise<void> {
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
 * 比较两个数组是否相等（基于指定的属性标识）
 * @param a 第一个数组
 * @param b 第二个数组
 * @param prop 用于比较的属性提取函数
 * @returns 如果两个数组长度相同且包含相同的元素（基于属性标识），则返回true，否则返回false
 * @example
 * // 比较两个对象数组的id属性
 * const list1 = [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}];
 * const list2 = [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}];
 * listEqual(list1, list2, item => item.id); // true
 * 
 * @example
 * // 比较两个字符串数组
 * const arr1 = ['a', 'b', 'c'];
 * const arr2 = ['a', 'b', 'c'];
 * listEqual(arr1, arr2, item => item); // true
 * 
 * @example
 * // 长度不同的数组
 * const arr1 = [1, 2, 3];
 * const arr2 = [1, 2];
 * listEqual(arr1, arr2, item => item.toString()); // false
 * 
 * @example
 * // 元素相同但顺序不同
 * const arr1 = [1, 2, 3];
 * const arr2 = [3, 2, 1];
 * listEqual(arr1, arr2, item => item.toString()); // true
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
 * 将嵌套子列表转换为平铺列表（单个节点处理）
 * @param node 当前处理的节点
 * @param children 获取子节点列表的函数，接收当前节点并返回其子节点数组
 * @param filter 可选过滤器函数，返回true表示包含该节点
 * @returns 平铺后的节点数组
 * @example
 * const tree = {
 *   id: 1,
 *   children: [
 *     { id: 2, children: [] },
 *     { id: 3, children: [{ id: 4, children: [] }] }
 *   ]
 * };
 * const flatList = listFlat(tree, node => node.children);
 * // 返回: [tree, {id:2}, {id:3}, {id:4}]
 */
export function listFlat<T>(node: T, children: (item: T) => T[], filter?: (item: T) => boolean): T[] {
    const result: T[] = [];
    if (!filter || filter(node)) result.push(node);
    result.push(...listFlats(children(node), children, filter));
    return result;
}

/**
 * 将嵌套子列表转换为平铺列表（列表处理）
 * @param list 要处理的节点列表
 * @param children 获取子节点列表的函数，接收当前节点并返回其子节点数组
 * @param filter 可选过滤器函数，返回true表示包含该节点
 * @returns 平铺后的节点数组
 * @example
 * const treeList = [
 *   {
 *     id: 1,
 *     children: [
 *       { id: 2, children: [] },
 *       { id: 3, children: [{ id: 4, children: [] }] }
 *     ]
 *   },
 *   { id: 5, children: [] }
 * ];
 * const flatList = listFlats(treeList, node => node.children);
 * // 返回: [{id:1}, {id:2}, {id:3}, {id:4}, {id:5}]
 * 
 * // 带过滤器的示例
 * const filteredList = listFlats(treeList, node => node.children, node => node.id > 2);
 * // 返回: [{id:3}, {id:4}, {id:5}]
 */
export function listFlats<T>(list: T[], children: (item: T) => T[], filter?: (item: T) => boolean): T[] {
    const result: T[] = [];
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        result.push(...listFlat(item, children, filter));
    }
    return result;
}

/**
 * 分页加载数据
 * @description 从指定起始页开始，自动加载所有分页数据并合并结果
 * @template TResult 返回结果项类型
 * @template Response 接口响应类型
 * @param firstPage 页面起始基准（0-based / 1-based，需与后端API保持一致）
 * @param load 加载方法，接收页码返回Promise<Response>
 * @param getTotalPages 从响应中提取总页数的方法
 * @param getItems 从响应中提取结果列表的方法
 * @param opt 可选配置项
 * @param opt.onError 错误回调函数（可选）
 * @param opt.onPage 每页加载完成回调函数（可选）
 * @returns 合并后的结果列表
 * @example
 * // 基础用法：加载用户数据
 * const users = await loadByPage(
 *   1,
 *   (page) => api.get('/users', { params: { page } }),
 *   (resp) => resp.data.pagination.totalPages,
 *   (resp) => resp.data.list
 * );
 * 
 * @example
 * // 高级用法：带回调监控和错误处理
 * const products = await loadByPage(
 *   1,
 *   (page) => productAPI.list({ page, pageSize: 50 }),
 *   (resp) => Math.ceil(resp.totalCount / 50),
 *   (resp) => resp.items,
 *   {
 *     onError: (err) => sentry.captureException(err),
 *     onPage: (resp) => {
 *       console.log(`Loaded ${resp.items.length} items from page ${resp.page}`)
 *     }
 *   }
 * );
 * 
 * @example
 * // 中断场景：当某页返回空时自动停止
 * // 注意：loadByPage会在遇到空响应时自动终止加载
 * const comments = await loadByPage(...);
 */
export async function loadByPage<TResult, Response>(
    /** 开始页码 */
    firstPage: number,
    /** 加载方法 */
    load: (page: number) => Promise<Response>,
    /** 获取总页数方法 */
    getTotalPages: (resp: Response) => number,
    /** 获取结果列表方法 */
    getItems: (resp: Response) => TResult[],
    opt?: {
        onError?: (error: unknown) => void,
        onPage?: (resp: Response) => void,
    }
) {
    const list = [] as TResult[];
    try {
        if (firstPage === null) {
            throw new Error('起始页码必须是有效数字');
        }
        let firstIndex = Number(firstPage) + 0;
        if (isNaN(firstIndex)) {
            throw new Error('起始页码必须是有效数字');
        }

        const first_resp = await load(firstIndex);
        if (!first_resp) return [];

        // 获取第一页数据列表（确保是数组）
        const firstPageItems = getItems(first_resp);
        if (!Array.isArray(firstPageItems)) {
            throw new Error('getItems 必须返回数组类型');
        }
        list.push(...firstPageItems);

        // 执行分页回调
        opt?.onPage?.(first_resp);

        // 计算总页数（确保是数字）
        let total = Number(getTotalPages(first_resp)) + firstIndex;
        if (isNaN(total)) {
            throw new Error('总页数必须是有效数字');
        }
        if (total > firstIndex) {
            for (let i = firstIndex + 1; i < total; i++) {
                const resp = await load(i);
                if (!resp) {
                    if (opt?.onError) opt.onError(``);
                    break;
                }

                // 更新总页数（每次请求后重新校验）
                total = Number(getTotalPages(resp)) + firstIndex;
                if (isNaN(total)) {
                    throw new Error('总页数必须是有效数字');
                }

                // 获取当前页数据列表（确保是数组）
                const currentItems = getItems(resp);
                if (!Array.isArray(currentItems)) {
                    throw new Error('getItems 必须返回数组类型');
                }

                list.push(...getItems(resp));
                if (opt?.onPage) opt.onPage(resp);
            }
        }
    } catch (error) {
        if (opt?.onError) opt.onError(error);
        // 捕获所有错误并返回空数组
        return list;
    }
    return list;
}

/**
 * 从键值列表生成对象
 * @param keys 键值列表，包含key和value的对象数组
 * @returns 由键值对组成的对象
 * @example
 * // 基本用法
 * const keyValueList = [
 *   { key: 'name', value: '张三' },
 *   { key: 'age', value: 25 },
 *   { key: 'isStudent', value: false }
 * ];
 * const result = listToObject(keyValueList);
 * // 返回结果: { name: '张三', age: 25, isStudent: false }
 * 
 * @example
 * // 空数组情况
 * const emptyList = [];
 * const emptyResult = listToObject(emptyList);
 * // 返回结果: {}
 */
export function listToObject(keys: { key: string, value: any }[]): { [key: string]: any } {
    const result: { [key: string]: any } = {};
    keys.forEach((item, index) => {
        result[item.key] = item.value;
    });
    return result;
}

/**
 * 获取两个数组的交集
 * @param list1 第一个数组
 * @param list2 第二个数组
 * @param equals 可选的自定义相等比较函数，如果未提供则使用深度比较
 * @returns 两个数组的交集数组
 * @example
 * // 基本类型数组
 * intersect([1, 2, 3], [2, 3, 4]); // 返回 [2, 3]
 * 
 * // 对象数组使用深度比较
 * intersect(
 *   [{id: 1, data: {name: 'A'}}], 
 *   [{id: 1, data: {name: 'A'}}]
 * ); // 返回 [{id: 1, data: {name: 'A'}}]
 * 
 * // 对象数组使用自定义比较函数（只比较id字段）
 * intersect(
 *   [{id: 1, name: 'A'}, {id: 2, name: 'B'}],
 *   [{id: 1, name: 'C'}, {id: 3, name: 'D'}],
 *   (x, y) => x.id === y.id
 * ); // 返回 [{id: 1, name: 'A'}]
 * 
 * // 特殊案例：null/undefined输入
 * intersect(null, [1, 2]); // 返回 []
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