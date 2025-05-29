// import { describe, expect, test } from '@jest/globals';
import { SetHelper } from "../src/utils/SetHelper";


describe('SetHelper 集合工具类', () => {
    // 测试数据复用
    const 数字集A = [1, 2, 3, 4] as any[];
    const 数字集B = [3, 4, 5, 6] as any[];
    const 字符串集 = ['a', 'b', 'c'] as any[];
    const 空集 = new SetHelper<any>([]);

    describe('union', () => {
        test('合并两个集合元素不重复', () => {
            const a = ["a", "b", "c"];
            const b = ["c", "d", "e", "f"];
            const s_a = new SetHelper(a);
            const s_b = new SetHelper(b);
            const result = s_a.union(s_b.items());

            // Use toEqual instead of toBe for array/object comparisons
            expect([...result.values()]).toEqual(["a", "b", "c", "d", "e", "f"]);
        });

        test('合并集合包含空集合', () => {
            const a = ["a", "b", "c"];
            const emptySet = new SetHelper([]);
            const result = new SetHelper(a).union(emptySet.items());
            expect([...result.values()]).toEqual(["a", "b", "c"]);
        });

        test('集合合并自身', () => {
            const a = ["a", "b", "c"];
            const s_a = new SetHelper(a);
            const result = s_a.union(s_a.items());
            expect([...result.values()]).toEqual(["a", "b", "c"]);
        });

        test('应该自动去重重复元素', () => {
            const a = ["a", "b", "c"];
            const b = ["c", "d", "e"]; // 包含重复元素 'c'
            const 结果 = new SetHelper(a).union(new SetHelper(b).items());
            expect([...结果.values()]).toEqual(["a", "b", "c", "d", "e"]);
        });

        test('应该处理不同类型元素', () => {
            const a = [1, 2, 3];
            const b = ["1", "2", "3"];
            const 结果 = new SetHelper<any>(a).union(new SetHelper(b).items());
            expect([...结果.values()]).toEqual([1, 2, 3, "1", "2", "3"]);
        });
    });

    describe('difference 差集方法', () => {
        test('应返回A有而B没有的元素', () => {
            const 结果 = new SetHelper(数字集A).difference(new SetHelper(数字集B).items());
            expect([...结果.values()]).toEqual([1, 2]);
        });

        test('B为空集时应返回A的全部元素', () => {
            const 结果 = new SetHelper(数字集A).difference(空集.items());
            expect([...结果.values()]).toEqual(数字集A);
        });

        test('A为空集时应返回空集', () => {
            const 结果 = 空集.difference(new SetHelper(数字集B).items());
            expect(结果.size).toBe(0);
        });
    });

    describe('intersection 交集方法', () => {
        test('应返回两个集合共有的元素', () => {
            const 结果 = new SetHelper(数字集A).intersection(new SetHelper(数字集B).items());
            expect([...结果.values()]).toEqual([3, 4]);
        });

        test('无交集时应返回空集', () => {
            const 结果 = new SetHelper(数字集A).intersection(new SetHelper(字符串集).items());
            expect(结果.size).toBe(0);
        });

        test('与空集交集应返回空集', () => {
            const 结果 = new SetHelper(数字集A).intersection(空集.items());
            expect(结果.size).toBe(0);
        });
    });

    describe('intersectionDifference 对称差集方法', () => {
        test('应返回仅属于一个集合的元素', () => {
            const 结果 = new SetHelper(数字集A).intersectionDifference(new SetHelper(数字集B).items());
            expect([...结果.values()]).toEqual([1, 2, 5, 6]);
        });

        test('与空集的对称差集应返回原集合', () => {
            const 结果 = new SetHelper(数字集A).intersectionDifference(空集.items());
            expect([...结果.values()]).toEqual(数字集A);
        });

        test('相同集合应返回空集', () => {
            const 集合 = new SetHelper(数字集A);
            const 结果 = 集合.intersectionDifference(集合.items());
            expect(结果.size).toBe(0);
        });
    });

    describe('isSubset 子集判断', () => {
        test('真子集应返回true', () => {
            const 子集 = new SetHelper([1, 2]);
            expect(子集.isSubset(new SetHelper(数字集A).items())).toBe(true);
        });

        test('非子集应返回false', () => {
            expect(new SetHelper([1, 5]).isSubset(new SetHelper(数字集A).items())).toBe(false);
        });

        test('空集是任何集合的子集', () => {
            expect(空集.isSubset(new SetHelper(数字集A).items())).toBe(true);
        });

        test('集合是自身的子集', () => {
            const 集合 = new SetHelper(数字集A);
            expect(集合.isSubset(集合.items())).toBe(true);
        });
    });

    describe('isSuperset 超集判断', () => {
        test('真超集应返回true', () => {
            const 超集 = new SetHelper([...数字集A, 5]);
            expect(超集.isSuperset(new SetHelper(数字集A).items())).toBe(true);
        });

        test('非超集应返回false', () => {
            expect(new SetHelper([1, 2]).isSuperset(new SetHelper(数字集A).items())).toBe(false);
        });

        test('空集不是非空集的超集', () => {
            expect(空集.isSuperset(new SetHelper(数字集A).items())).toBe(false);
        });

        test('集合是自身的超集', () => {
            const 集合 = new SetHelper(数字集A);
            expect(集合.isSuperset(集合.items())).toBe(true);
        });
    });

    // 边缘情况专项测试
    describe('边缘情况处理', () => {
        test('传入非Set参数应返回空集', () => {
            const 集合 = new SetHelper(数字集A);
            // @ts-ignore 故意测试错误类型
            expect(集合.union(null).size).toBe(4);
            // @ts-ignore
            expect(集合.intersection(undefined).size).toBe(0);
        });

        test('不同类型元素应正确处理', () => {
            const 混合集A = [1, '1', true];
            const 混合集B = ['1', false];
            const 结果 = new SetHelper(混合集A).intersection(new SetHelper(混合集B).items());
            expect([...结果.values()]).toEqual(['1']);
        });
    });
});