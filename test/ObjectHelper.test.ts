import { areObjectEqual } from "../src/utils/ObjectHelper";

describe('areObjectEqual 方法测试', () => {
  // 测试基本类型的相等性
  it('相同的基本类型值应该返回 true', () => {
    expect(areObjectEqual(5, 5)).toBe(true);
    expect(areObjectEqual('测试', '测试')).toBe(true);
    expect(areObjectEqual(true, true)).toBe(true);
    expect(areObjectEqual(null, null)).toBe(true);
    expect(areObjectEqual(undefined, undefined)).toBe(true);
  });

  // 测试基本类型的不等性
  it('不同的基本类型值应该返回 false', () => {
    expect(areObjectEqual(5, 6)).toBe(false);
    expect(areObjectEqual('测试', '测试2')).toBe(false);
    expect(areObjectEqual(true, false)).toBe(false);
    expect(areObjectEqual(null, undefined)).toBe(false);
  });

  // 测试对象的相等性
  it('相同的对象应该返回 true', () => {
    const obj1 = { a: 1, b: '测试', c: true };
    const obj2 = { a: 1, b: '测试', c: true };
    expect(areObjectEqual(obj1, obj2)).toBe(true);
  });

  // 测试对象的不等性
  it('不同的对象应该返回 false', () => {
    const obj1 = { a: 1, b: '测试', c: true };
    const obj2 = { a: 1, b: '测试', c: false };
    expect(areObjectEqual(obj1, obj2)).toBe(false);
  });

  // 测试排除键的功能
  it('应该忽略排除的键进行比较', () => {
    const obj1 = { a: 1, b: '测试', page: 1 };
    const obj2 = { a: 1, b: '测试', page: 2 };
    expect(areObjectEqual(obj1, obj2, { excludeKeys: ['page'] })).toBe(true);
  });

  // 测试多个排除键的情况
  it('应该忽略多个排除的键', () => {
    const obj1 = { a: 1, b: '测试', page: 1, sort: 'asc' };
    const obj2 = { a: 1, b: '测试', page: 2, sort: 'desc' };
    expect(areObjectEqual(obj1, obj2, { excludeKeys: ['page', 'sort'] })).toBe(true);
  });

  // 测试嵌套对象
  it('应该正确处理嵌套对象', () => {
    const obj1 = { a: 1, b: { c: '测试', d: true } };
    const obj2 = { a: 1, b: { c: '测试', d: true } };
    expect(areObjectEqual(obj1, obj2)).toBe(true);
  });

  // 测试嵌套对象的不同
  it('应该检测出嵌套对象的不同', () => {
    const obj1 = { a: 1, b: { c: '测试', d: true } };
    const obj2 = { a: 1, b: { c: '测试', d: false } };
    expect(areObjectEqual(obj1, obj2)).toBe(false);
  });

  // 测试 undefined 值的特殊情况
  it('应该将 {key: undefined} 和 {} 视为相等', () => {
    const obj1 = { a: undefined as any };
    const obj2 = {};
    expect(areObjectEqual(obj1, obj2)).toBe(true);
    expect(areObjectEqual(obj2, obj1)).toBe(true);
  });

  // 测试 undefined 与其他值的比较
  it('应该正确处理 undefined 与其他值的比较', () => {
    const obj1 = { a: undefined as any };
    const obj2 = { a: null as any };
    const obj3 = { a: 0 };
    expect(areObjectEqual(obj1, obj2)).toBe(true);
    expect(areObjectEqual(obj1, obj2, { strictNull: true })).toBe(false);
    expect(areObjectEqual(obj1, obj3)).toBe(false);
  });

  // 测试数组的相等性
  it('应该正确处理数组的比较', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2, 3];
    const arr3 = [1, 2, 4];
    expect(areObjectEqual(arr1, arr2)).toBe(true);
    expect(areObjectEqual(arr1, arr3)).toBe(false);
  });

  // 测试不同键数量的对象
  it('键数量不同的对象应该返回 false', () => {
    const obj1 = { a: 1, b: '测试' };
    const obj2 = { a: 1 };
    expect(areObjectEqual(obj1, obj2)).toBe(false);
  });

  // 测试排除键后的键数量比较
  it('排除键后键数量不同的对象应该返回 false', () => {
    const obj1 = { a: 1, page: 1 };
    const obj2 = { a: 1, b: 2, page: 1 };
    expect(areObjectEqual(obj1, obj2, { excludeKeys: ['page'] })).toBe(false);
  });
});