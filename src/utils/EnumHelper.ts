/*
* @Author: Lin Ya
* @Date: 2022-07-30 09:19:25
 * @LastEditors: Lin Ya
 * @LastEditTime: 2022-11-03 17:28:19
* @Description: 枚举方法
*/
import { isNumber } from "./StringHelper";
export interface KeyValue {
    key: string;
    value: any;
}

/**
 * 获取枚举遍历键值对列表
 * @param enumValue 枚举值
 * @returns 枚举列表
 */
export function enumKey(enumValue: any): KeyValue[] {
    let list: KeyValue[] = [];
    Object.entries(enumValue).filter(([key, value]) => !isNumber(key)).forEach(([key, value]) => {
        list.push({ key: key, value: value });
    });
    return list;
}

/**
 * 获取枚举字串
 * @param enumValue 枚举对象
 * @param value 枚举值
 * @returns 
 */
export function enumStr(enumValue: any, value: any): string | undefined {
    return enumKey(enumValue).find(x => x.value === value)?.key
}

