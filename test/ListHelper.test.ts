/*
 * @Author: Lin Ya
 * @Date: 2024-08-19 17:59:47
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-07-02 09:56:57
 * @Description: ListHelper test
 */
import { getCombinations, groupBy, groupByFunc, intersect, listDistinct, listEqual, listFlat, listFlats, listGroupSum, listGroupSumAll, listGroupSumFirst, listPageAction, listSum, listToObject, loadByPage } from "../src/utils/ListHelper";
// import { describe, expect, test } from '@jest/globals';
describe('listSum 组合求和', () => {
    test("listSum", () => {
        const list = [1, 2, 3, 4, 5];
        expect(listSum(list, x => x)).toBe(15);
    });

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


describe('groupBy', () => {
    it('应该按照指定键对对象数组进行分组', () => {
        const arr = [
            { id: 1, category: 'fruit', name: 'apple' },
            { id: 2, category: 'fruit', name: 'banana' },
            { id: 3, category: 'vegetable', name: 'carrot' },
        ];

        const result = groupBy(arr, 'category');

        expect(result).toEqual({
            fruit: [
                { id: 1, category: 'fruit', name: 'apple' },
                { id: 2, category: 'fruit', name: 'banana' },
            ],
            vegetable: [
                { id: 3, category: 'vegetable', name: 'carrot' },
            ],
        });
    });

    it('当键值为数字时应该正确分组', () => {
        const arr = [
            { id: 1, age: 20, name: 'Alice' },
            { id: 2, age: 20, name: 'Bob' },
            { id: 3, age: 30, name: 'Charlie' },
        ];

        const result = groupBy(arr, 'age');

        expect(result).toEqual({
            20: [
                { id: 1, age: 20, name: 'Alice' },
                { id: 2, age: 20, name: 'Bob' },
            ],
            30: [
                { id: 3, age: 30, name: 'Charlie' },
            ],
        });
    });

    it('空数组应该返回空对象', () => {
        const result = groupBy([], 'anyKey' as never);
        expect(result).toEqual({});
    });
});

describe('groupByFunc', () => {
    it('应该使用自定义函数对数组进行分组', () => {
        const arr = [
            { name: 'Alice', age: 20 },
            { name: 'Bob', age: 25 },
            { name: 'Charlie', age: 30 },
        ];

        const result = groupByFunc(arr, (item) => {
            if (item.age < 21) return 'young';
            if (item.age < 30) return 'adult';
            return 'senior';
        });

        expect(result).toEqual({
            young: [{ name: 'Alice', age: 20 }],
            adult: [{ name: 'Bob', age: 25 }],
            senior: [{ name: 'Charlie', age: 30 }],
        });
    });

    it('应该支持返回数字作为分组键', () => {
        const arr = [
            { value: 10, name: 'A' },
            { value: 20, name: 'B' },
            { value: 10, name: 'C' },
        ];

        const result = groupByFunc(arr, (item) => item.value);

        expect(result).toEqual({
            10: [
                { value: 10, name: 'A' },
                { value: 10, name: 'C' },
            ],
            20: [
                { value: 20, name: 'B' },
            ],
        });
    });

    it('空数组应该返回空对象', () => {
        const result = groupByFunc([], (item: any) => item.key);
        expect(result).toEqual({});
    });

    it('应该处理复杂的分组逻辑', () => {
        const arr = [
            { name: 'Alice', score: 85 },
            { name: 'Bob', score: 92 },
            { name: 'Charlie', score: 78 },
            { name: 'David', score: 85 },
        ];

        const result = groupByFunc(arr, (item) => {
            if (item.score >= 90) return 'A';
            if (item.score >= 80) return 'B';
            return 'C';
        });

        expect(result).toEqual({
            A: [{ name: 'Bob', score: 92 }],
            B: [
                { name: 'Alice', score: 85 },
                { name: 'David', score: 85 },
            ],
            C: [{ name: 'Charlie', score: 78 }],
        });
    });
});

describe('listSum', () => {
    test('计算数值数组的和', () => {
        const list = [1, 2, 3, 4];
        const result = listSum(list, x => x);
        expect(result).toBe(10);
    });

    test('计算对象数组属性值的和', () => {
        const list = [{ value: 1 }, { value: 2 }, { value: 3 }];
        const result = listSum(list, item => item.value);
        expect(result).toBe(6);
    });

    test('空数组返回0', () => {
        const list: number[] = [];
        const result = listSum(list, x => x);
        expect(result).toBe(0);
    });

    test('处理非数值转换', () => {
        const list = ['1', '2', '3'];
        const result = listSum(list, x => parseInt(x));
        expect(result).toBe(6);
    });
});

describe('getCombinations', () => {
    test('获取长度为2的组合', () => {
        const array = [1, 2, 3];
        const result = getCombinations(array, 2);
        expect(result).toEqual([[1, 2], [1, 3], [2, 3]]);
    });

    test('获取长度为1的组合', () => {
        const array = ['a', 'b'];
        const result = getCombinations(array, 1);
        expect(result).toEqual([['a'], ['b']]);
    });

    test('组合长度大于数组长度返回空数组', () => {
        const array = [1, 2];
        const result = getCombinations(array, 3);
        expect(result).toEqual([]);
    });

    test('空数组返回空数组', () => {
        const array: number[] = [];
        const result = getCombinations(array, 1);
        expect(result).toEqual([]);
    });
});

describe('listGroupSum', () => {
    test('找到和为5的2个元素的组合', () => {
        const list = [1, 2, 3, 4, 5];
        const result = listGroupSum(list, x => x, 5, 2);
        expect(result).toEqual([[1, 4], [2, 3]]);
    });

    test('没有满足条件的组合返回空数组', () => {
        const list = [1, 2, 3];
        const result = listGroupSum(list, x => x, 10, 2);
        expect(result).toEqual([]);
    });

    test('对象数组的测试', () => {
        const list = [{ val: 1 }, { val: 2 }, { val: 3 }];
        const result = listGroupSum(list, x => x.val, 3, 2);
        expect(result).toEqual([[{ val: 1 }, { val: 2 }]]);
    });
});

describe('listGroupSumFirst', () => {
    test('找到第一个满足条件的组合', () => {
        const list = [1, 2, 3, 4, 5];
        const result = listGroupSumFirst(list, x => x, 5, 3);
        expect(result).toEqual([5]);
    });

    test('没有满足条件的组合返回undefined', () => {
        const list = [1, 2, 3];
        const result = listGroupSumFirst(list, x => x, 10, 2);
        expect(result).toBeUndefined();
    });

    test('从多个可能的组合中返回第一个', () => {
        const list = [1, 2, 3, 4, 5];
        const result = listGroupSumFirst(list, x => x, 6, 3);
        // 可能返回 [1,5] 或 [2,4] 取决于实现
        expect(result).toEqual(expect.arrayContaining([expect.any(Number), expect.any(Number)]));
        expect(listSum(result!, x => x)).toBe(6);
    });
});

describe('listGroupSumAll', () => {
    test('找到所有满足条件的组合', () => {
        const list = [1, 2, 3, 4, 5];
        const result = listGroupSumAll(list, x => x, 5, 3);
        expect(result).toEqual(expect.arrayContaining([[5], [1, 4], [2, 3]]));
        expect(result.length).toBe(3);
    });

    test('没有满足条件的组合返回空数组', () => {
        const list = [1, 2, 3];
        const result = listGroupSumAll(list, x => x, 10, 2);
        expect(result).toEqual([]);
    });

    test('包含不同大小的组合', () => {
        const list = [1, 2, 3, 4, 5, 6];
        const result = listGroupSumAll(list, x => x, 6, 3);
        expect(result).toEqual(expect.arrayContaining([
            [6],
            [1, 5],
            [2, 4],
            [1, 2, 3]
        ]));
    });
});

describe('listPageAction', () => {
    // 模拟的异步处理函数
    const mockHandler = jest.fn(async (items: any[], startIndex: number) => {
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 10));
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('空数组不执行handler', async () => {
        await listPageAction([], mockHandler);
        expect(mockHandler).not.toHaveBeenCalled();
    });

    test('null/undefined数组不执行handler', async () => {
        await listPageAction(null as any, mockHandler);
        await listPageAction(undefined as any, mockHandler);
        expect(mockHandler).not.toHaveBeenCalled();
    });

    test('默认分页大小(100)', async () => {
        const array = Array.from({ length: 250 }, (_, i) => i);
        await listPageAction(array, mockHandler);

        expect(mockHandler).toHaveBeenCalledTimes(3);
        expect(mockHandler).toHaveBeenNthCalledWith(1, expect.arrayContaining(Array.from({ length: 100 }, (_, i) => i)), 0);
        expect(mockHandler).toHaveBeenNthCalledWith(2, expect.arrayContaining(Array.from({ length: 100 }, (_, i) => i + 100)), 100);
        expect(mockHandler).toHaveBeenNthCalledWith(3, expect.arrayContaining(Array.from({ length: 50 }, (_, i) => i + 200)), 200);
    });

    test('自定义分页大小', async () => {
        const array = Array.from({ length: 25 }, (_, i) => i);
        await listPageAction(array, mockHandler, 10);

        expect(mockHandler).toHaveBeenCalledTimes(3);
        expect(mockHandler).toHaveBeenNthCalledWith(1, expect.arrayContaining(Array.from({ length: 10 }, (_, i) => i)), 0);
        expect(mockHandler).toHaveBeenNthCalledWith(2, expect.arrayContaining(Array.from({ length: 10 }, (_, i) => i + 10)), 10);
        expect(mockHandler).toHaveBeenNthCalledWith(3, expect.arrayContaining(Array.from({ length: 5 }, (_, i) => i + 20)), 20);
    });

    test('正确处理handler抛出的错误', async () => {
        const errorHandler = jest.fn(async (items: any[]) => {
            throw new Error('Test error');
        });

        const array = [1, 2, 3];
        await expect(listPageAction(array, errorHandler)).rejects.toThrow('Test error');
    });

    test('验证分页顺序和执行顺序', async () => {
        const array = [1, 2, 3, 4, 5];
        const executionOrder: number[] = [];

        const orderHandler = jest.fn(async (items: number[], startIndex: number) => {
            executionOrder.push(...items);
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        await listPageAction(array, orderHandler, 2);

        expect(executionOrder).toEqual([1, 2, 3, 4, 5]);
        expect(orderHandler).toHaveBeenCalledTimes(3);
    });

    test('pageSize为0时使用默认值', async () => {
        const array = Array.from({ length: 250 }, (_, i) => i);
        await listPageAction(array, mockHandler, 0);

        // 默认值100，250条数据应该分3次处理
        expect(mockHandler).toHaveBeenCalledTimes(3);
    });
});


// 定义树节点接口
interface TreeNode {
    id: number;
    children: TreeNode[];
}

describe('listFlat 方法测试', () => {
    it('应能平铺无子节点的单个节点', () => {
        const node: TreeNode = { id: 1, children: [] };
        const result = listFlat(node, (n) => n.children);
        expect(result).toEqual([node]);
    });

    it('应能平铺嵌套节点结构', () => {
        const node: TreeNode = {
            id: 1,
            children: [
                { id: 2, children: [] },
                { id: 3, children: [{ id: 4, children: [] }] }
            ]
        };
        const result = listFlat(node, (n) => n.children);
        expect(result).toEqual([
            node,
            node.children[0],
            node.children[1],
            node.children[1].children[0]
        ]);
    });

    it('应能应用过滤器筛选节点', () => {
        const node: TreeNode = {
            id: 1,
            children: [
                { id: 2, children: [] },
                { id: 3, children: [{ id: 4, children: [] }] }
            ]
        };
        // 只保留 id > 2 的节点
        const result = listFlat(node, (n) => n.children, (n) => n.id > 2);
        expect(result).toEqual([
            node.children[1],
            node.children[1].children[0]
        ]);
    });

    it('应能正确处理符合过滤条件的节点', () => {
        const node: TreeNode = {
            id: 1,
            children: [
                { id: 2, children: [] },
                { id: 3, children: [] }
            ]
        };
        // 只保留 id === 2 的节点
        const result = listFlat(node, (n) => n.children, (n) => n.id === 2);
        expect(result).toEqual([node.children[0]]);
    });
});

describe('listFlats 方法测试', () => {
    it('输入空数组应返回空数组', () => {
        const result = listFlats<TreeNode>([], (n) => n.children);
        expect(result).toEqual([]);
    });

    it('应能平铺多个根节点', () => {
        const list: TreeNode[] = [
            { id: 1, children: [{ id: 2, children: [] }] },
            { id: 3, children: [] }
        ];
        const result = listFlats(list, (n) => n.children);
        expect(result).toEqual([
            list[0],
            list[0].children[0],
            list[1]
        ]);
    });

    it('应对多个根节点应用过滤器', () => {
        const list: TreeNode[] = [
            { id: 1, children: [{ id: 2, children: [] }] },
            { id: 3, children: [] }
        ];
        // 只保留奇数 id 节点
        const result = listFlats(list, (n) => n.children, (n) => n.id % 2 === 1);
        expect(result).toEqual([
            list[0],
            list[1]
        ]);
    });

    it('应能处理复杂嵌套结构', () => {
        const list: TreeNode[] = [
            {
                id: 1,
                children: [
                    { id: 2, children: [{ id: 5, children: [] }] },
                    { id: 3, children: [] }
                ]
            },
            {
                id: 4,
                children: []
            }
        ];
        const result = listFlats(list, (n) => n.children);
        expect(result).toEqual([
            list[0],
            list[0].children[0],
            list[0].children[0].children[0],
            list[0].children[1],
            list[1]
        ]);
    });

    it('应支持自定义节点类型', () => {
        // 定义自定义节点类型
        interface CustomNode {
            value: string;
            nodes: CustomNode[];
        }

        const list: CustomNode[] = [
            {
                value: 'A',
                nodes: [
                    { value: 'B', nodes: [] },
                    { value: 'C', nodes: [{ value: 'D', nodes: [] }] }
                ]
            }
        ];

        // 测试自定义子节点字段名
        const result = listFlats(list, (n) => n.nodes);
        expect(result).toEqual([
            list[0],
            list[0].nodes[0],
            list[0].nodes[1],
            list[0].nodes[1].nodes[0]
        ]);
    });
});

describe('loadByPage', () => {
    // 模拟响应类型
    type MockResponse = {
        totalPages: number;
        items: any[];
    };

    // 基本模拟参数
    // const mockLoad = jest.fn();
    const mockGetTotalPages = jest.fn((resp: MockResponse) => resp.totalPages);
    const mockGetItems = jest.fn((resp: MockResponse) => resp.items);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('应该返回空数组当首次加载失败时', async () => {
        const mockLoad = jest.fn();
        mockLoad.mockRejectedValueOnce(new Error('Network error'));

        const result = await loadByPage(
            1,
            mockLoad,
            mockGetTotalPages,
            mockGetItems
        );

        expect(result).toEqual([]);
        expect(mockLoad).toHaveBeenCalledTimes(1);
    });

    it('应该加载单页数据当总页数为1', async () => {
        const mockData = {
            totalPages: 1,
            items: [{ id: 1 }, { id: 2 }]
        };
        const mockLoad = jest.fn();
        mockLoad.mockResolvedValueOnce(mockData);

        const result = await loadByPage(
            1,
            mockLoad,
            mockGetTotalPages,
            mockGetItems
        );

        expect(result).toEqual(mockData.items);
        expect(mockLoad).toHaveBeenCalledTimes(1);
        expect(mockGetTotalPages).toHaveBeenCalledWith(mockData);
        expect(mockGetItems).toHaveBeenCalledWith(mockData);
    });

    it('应该加载多页数据', async () => {
        const mockData1 = {
            totalPages: 3,
            items: [{ id: 1 }, { id: 2 }]
        };
        const mockData2 = {
            totalPages: 3,
            items: [{ id: 3 }, { id: 4 }]
        };
        const mockData3 = {
            totalPages: 3,
            items: [{ id: 5 }, { id: 6 }]
        };

        const mockLoad = jest.fn();
        mockLoad
            .mockResolvedValueOnce(mockData1)
            .mockResolvedValueOnce(mockData2)
            .mockResolvedValueOnce(mockData3);

        const result = await loadByPage(
            1,
            mockLoad,
            mockGetTotalPages,
            mockGetItems
        );

        expect(result).toEqual([...mockData1.items, ...mockData2.items, ...mockData3.items]);
        expect(mockLoad).toHaveBeenCalledTimes(3);
        expect(mockLoad).toHaveBeenNthCalledWith(1, 1);
        expect(mockLoad).toHaveBeenNthCalledWith(2, 2);
        expect(mockLoad).toHaveBeenNthCalledWith(3, 3);
    });

    it('应该停止加载当中间页失败时', async () => {
        const mockData1 = {
            totalPages: 3,
            items: [{ id: 1 }, { id: 2 }]
        };
        const mockData2 = {
            totalPages: 3,
            items: [{ id: 3 }, { id: 4 }]
        };

        const mockLoad = jest.fn();
        mockLoad
            .mockResolvedValueOnce(mockData1)
            .mockRejectedValueOnce(new Error('Page 2 failed'))
            .mockResolvedValueOnce(mockData2);

        const result = await loadByPage(
            1,
            mockLoad,
            mockGetTotalPages,
            mockGetItems
        );

        expect(result).toEqual(mockData1.items);
        expect(mockLoad).toHaveBeenCalledTimes(2); // 第3页不会尝试加载
    });

    it('应该正确处理从0开始的页码', async () => {
        const mockData0 = {
            totalPages: 2,
            items: [{ id: 1 }, { id: 2 }]
        };
        const mockData1 = {
            totalPages: 2,
            items: [{ id: 3 }, { id: 4 }]
        };

        const mockLoad = jest.fn();
        mockLoad
            .mockResolvedValueOnce(mockData0)
            .mockResolvedValueOnce(mockData1);

        const result = await loadByPage(
            0,
            mockLoad,
            mockGetTotalPages,
            mockGetItems
        );

        expect(result).toEqual([...mockData0.items, ...mockData1.items]);
        expect(mockLoad).toHaveBeenCalledTimes(2);
        expect(mockLoad).toHaveBeenNthCalledWith(1, 0);
        expect(mockLoad).toHaveBeenNthCalledWith(2, 1);
    });

    it('应该正确处理动态总页数变化的情况', async () => {
        const mockData1 = {
            totalPages: 3,
            items: [{ id: 1 }]
        };
        const mockData2 = {
            totalPages: 4, // 总页数变化
            items: [{ id: 2 }]
        };
        const mockData3 = {
            totalPages: 4,
            items: [{ id: 3 }]
        };
        const mockData4 = {
            totalPages: 4,
            items: [{ id: 4 }]
        };

        const mockLoad = jest.fn();
        mockLoad
            .mockResolvedValueOnce(mockData1)
            .mockResolvedValueOnce(mockData2)
            .mockResolvedValueOnce(mockData3)
            .mockResolvedValueOnce(mockData4);

        // 动态获取总页数的函数
        const dynamicGetTotalPages = jest.fn((resp: MockResponse) => resp.totalPages);

        const result = await loadByPage(
            1,
            mockLoad,
            dynamicGetTotalPages,
            mockGetItems
        );

        expect(result).toEqual([
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 }
        ]);
        expect(mockLoad).toHaveBeenCalledTimes(4);
    });
});

describe('listToObject', () => {
    it('应该将键值对数组转换为对象', () => {
        const input = [
            { key: 'name', value: '张三' },
            { key: 'age', value: 25 },
            { key: 'isStudent', value: false },
        ];

        const expected = {
            name: '张三',
            age: 25,
            isStudent: false,
        };

        expect(listToObject(input)).toEqual(expected);
    });

    it('应该处理空数组', () => {
        expect(listToObject([])).toEqual({});
    });

    it('应该覆盖所有键值类型', () => {
        const input = [
            { key: 'string', value: 'text' },
            { key: 'number', value: 123 },
            { key: 'boolean', value: true },
            { key: 'null', value: null },
            { key: 'undefined', value: undefined },
            { key: 'object', value: { a: 1 } },
            { key: 'array', value: [1, 2, 3] },
        ];

        const expected: Record<string, any> = {
            string: 'text',
            number: 123,
            boolean: true,
            null: null,
            undefined: undefined,
            object: { a: 1 },
            array: [1, 2, 3],
        };

        expect(listToObject(input)).toEqual(expected);
    });

    it('对于重复键应该保留最后一个值', () => {
        const input = [
            { key: 'name', value: '张三' },
            { key: 'name', value: '李四' },
            { key: 'age', value: 25 },
            { key: 'age', value: 30 },
        ];

        const expected = {
            name: '李四',
            age: 30,
        };

        expect(listToObject(input)).toEqual(expected);
    });
});

describe('listEqual 方法测试', () => {
    // 测试对象数组（相同顺序）
    test('相同顺序的对象数组应返回 true', () => {
        const list1 = [{ id: 1, name: '张三' }, { id: 2, name: '李四' }];
        const list2 = [{ id: 1, name: '张三' }, { id: 2, name: '李四' }];
        const result = listEqual(list1, list2, item => item.id.toString());
        expect(result).toBe(true);
    });

    // 测试对象数组（不同顺序）
    test('不同顺序但元素相同的对象数组应返回 true', () => {
        const list1 = [{ id: 1, name: '张三' }, { id: 2, name: '李四' }];
        const list2 = [{ id: 2, name: '李四' }, { id: 1, name: '张三' }];
        const result = listEqual(list1, list2, item => item.id.toString());
        expect(result).toBe(true);
    });

    // 测试基本类型数组
    test('相同的基本类型数组应返回 true', () => {
        const arr1 = ['苹果', '香蕉', '橙子'];
        const arr2 = ['苹果', '香蕉', '橙子'];
        const result = listEqual(arr1, arr2, item => item);
        expect(result).toBe(true);
    });

    // 测试长度不同的数组
    test('长度不同的数组应返回 false', () => {
        const arr1 = [1, 2, 3];
        const arr2 = [1, 2];
        const result = listEqual(arr1, arr2, item => item.toString());
        expect(result).toBe(false);
    });

    // 测试元素不同的数组
    test('元素不同的数组应返回 false', () => {
        const list1 = [{ id: 1, name: '张三' }, { id: 2, name: '李四' }];
        const list2 = [{ id: 1, name: '张三' }, { id: 3, name: '王五' }];
        const result = listEqual(list1, list2, item => item.id.toString());
        expect(result).toBe(false);
    });

    // 测试空数组
    test('两个空数组应返回 true', () => {
        const arr1: number[] = [];
        const arr2: number[] = [];
        const result = listEqual(arr1, arr2, item => item.toString());
        expect(result).toBe(true);
    });

    // 测试一个空数组和一个非空数组
    test('空数组和非空数组应返回 false', () => {
        const arr1: number[] = [];
        const arr2 = [1, 2, 3];
        const result = listEqual(arr1, arr2, item => item.toString());
        expect(result).toBe(false);
    });

    // 测试重复元素的数组
    test('包含重复元素的数组比较', () => {
        const arr1 = [1, 2, 2, 3];
        const arr2 = [1, 2, 3, 2];
        const result = listEqual(arr1, arr2, item => item.toString());
        expect(result).toBe(true);
    });
});


describe('intersect 方法测试', () => {
    // 基础类型数组测试
    test('基本类型数组 - 数字', () => {
        expect(intersect([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
        expect(intersect([1, 2], [3, 4])).toEqual([]);
    });

    test('基本类型数组 - 字符串', () => {
        expect(intersect(['a', 'b'], ['b', 'c'])).toEqual(['b']);
    });

    // 对象数组深度比较测试
    test('对象数组 - 默认深度比较', () => {
        const obj1 = { id: 1, data: { name: 'A' } };
        const obj2 = { id: 1, data: { name: 'A' } };
        const obj3 = { id: 2, data: { name: 'B' } };

        expect(intersect([obj1], [obj2])).toEqual([obj1]);
        expect(intersect([obj1], [obj3])).toEqual([]);
    });

    // 自定义比较函数测试
    test('对象数组 - 自定义比较函数', () => {
        const list1 = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
        const list2 = [{ id: 1, name: 'C' }, { id: 3, name: 'D' }];

        const customCompare = (x: any, y: any) => x.id === y.id;
        expect(intersect(list1, list2, customCompare)).toEqual([{ id: 1, name: 'A' }]);
    });

    // 边界条件测试
    test('空数组或null/undefined输入', () => {
        expect(intersect([], [1, 2])).toEqual([]);
        expect(intersect(null as any, [1, 2])).toEqual([]);
        expect(intersect(undefined as any, [1, 2])).toEqual([]);
    });

    // 特殊值测试
    test('包含特殊值的数组 - null/undefined/NaN', () => {
        expect(intersect([null, 1], [null, 2])).toEqual([null]);
        expect(intersect([undefined, 1], [undefined, 2])).toEqual([undefined]);
        expect(intersect([NaN], [NaN])).toEqual([]);
    });

    // 性能测试大数据量
    test('大数据量测试', () => {
        const bigArray1 = Array.from({ length: 10000 }, (_, i) => i);
        const bigArray2 = Array.from({ length: 10000 }, (_, i) => i + 5000);

        const result = intersect(bigArray1, bigArray2, (x, y) => x === y);
        expect(result.length).toBe(5000);
        expect(result[0]).toBe(5000);
        expect(result[4999]).toBe(9999);
    });
});