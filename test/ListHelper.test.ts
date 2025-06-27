/*
 * @Author: Lin Ya
 * @Date: 2024-08-19 17:59:47
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-06-27 15:55:07
 * @Description: ListHelper test
 */
import { listDistinct, listEqual, listSum } from "../src/utils/ListHelper";
// import { describe, expect, test } from '@jest/globals';
describe('listSum 组合求和', () => {
    test("listSum", () => {
        const list = [1, 2, 3, 4, 5];
        expect(listSum(list, x => x)).toBe(15);
    });

    test("lista equal listb", () => {
        const a = ["1", "m", "n"];
        const b = ["1", "m", "n"];
        expect(listEqual(a, b, x => x)).toBeTruthy();
    })
});

describe('listDistinct 数组去重函数', () => {
    test('基础类型数组去重', () => {
        // 数字数组去重
        expect(listDistinct([1, 2, 2, 3])).toEqual([1, 2, 3]);
        // 字符串数组去重
        expect(listDistinct(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });

    test('空数组处理', () => {
        expect(listDistinct([])).toEqual([]);
    });

    test('对象数组按属性去重', () => {
        const 用户列表 = [
            { id: 1, 姓名: '张三' },
            { id: 2, 姓名: '李四' },
            { id: 1, 姓名: '张三' }, // 重复ID
            { id: 3, 姓名: '王五' },
            { id: 2, 姓名: '李四' }  // 重复ID
        ];

        const 去重结果 = listDistinct(用户列表, 用户 => 用户.id.toString());
        expect(去重结果).toEqual([
            { id: 1, 姓名: '张三' },
            { id: 2, 姓名: '李四' },
            { id: 3, 姓名: '王五' }
        ]);
    });

    test('自定义key生成函数', () => {
        const 商品列表 = [
            { code: 'A01', name: '手机', price: 1999 },
            { code: 'A02', name: '电脑', price: 4999 },
            { code: 'A01', name: '手机', price: 1999 }, // 完全重复
            { code: 'A01', name: '手机', price: 2199 }   // code相同但价格不同
        ];

        // 测试1：按code去重
        const 按code去重 = listDistinct(商品列表, 商品 => 商品.code);
        expect(按code去重.length).toBe(2);

        // 测试2：按code+price组合去重
        const 按组合去重 = listDistinct(商品列表, 商品 => `${商品.code}-${商品.price}`);
        expect(按组合去重.length).toBe(3);
    });

    test('未提供prop参数时使用默认处理', () => {
        // 测试基础类型
        expect(listDistinct([true, false, true])).toEqual([true, false]);

        // 测试对象引用
        const obj = { key: 'value' };
        expect(listDistinct([obj, obj, { key: 'value' }])).toEqual([{ key: 'value' }]);
    });

    test('特殊值处理', () => {
        // null和undefined值
        expect(listDistinct([null, undefined, null])).toEqual([null, undefined]);

        // 混合类型数组
        expect(listDistinct([1, '1', 1])).toEqual([1, '1']);
    });

    test('大数组性能测试', () => {
        // 生成10万条有重复的数据
        const bigArray = Array(100000).fill(0).map((_, i) => ({
            id: i % 1000, // 故意制造重复
            value: `item-${i}`
        }));

        // 使用字符串键应该快速执行
        const start = performance.now();
        const result = listDistinct(bigArray, item => item.id.toString());
        const duration = performance.now() - start;

        expect(result.length).toBe(1000);
        // console.log(`去重耗时: ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(100); // 确保在100ms内完成
    });
});