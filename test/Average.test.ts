import { Average } from "../src/utils/Average";

describe('构造函数', () => {
  it('未传参数时应使用默认长度10', () => {
    const average = new Average();
    expect(average['count']).toBe(10); // 检查内部count值
  });

  it('传入正数时应使用指定长度', () => {
    const average = new Average(5);
    expect(average['count']).toBe(5);
  });

  it('传入负数时应使用默认长度', () => {
    const average = new Average(-3);
    expect(average['count']).toBe(10);
  });
});

describe('添加数值和计算', () => {
  it('单个数值的平均值应为自身', () => {
    const average = new Average();
    average.add(10);
    expect(average.value()).toBe(10);
  });

  it('应正确计算3个数值的平均值', () => {
    const average = new Average(3);
    average.add(10);
    average.add(20);
    average.add(30);
    expect(average.value()).toBe(20); // (10+20+30)/3
  });

  it('队列长度超过限制时应移除最早的值', () => {
    const average = new Average(3);
    average.add(10);
    average.add(20);
    average.add(30);
    average.add(40); // 此时队列应为 [20,30,40]
    expect(average.value()).toBe(30);
  });
});

describe('平滑平均值', () => {
  it('应基于平均值队列计算二次平均', () => {
    const average = new Average(3);
    average.add(10); // 当前平均值: 10 → 平均值队列: [10]
    average.add(20); // 当前平均值: 15 → 平均值队列: [10,15]
    average.add(30); // 当前平均值: 20 → 平均值队列: [10,15,20]
    expect(average.smoothValue()).toBe(15); // (10+15+20)/3

    average.add(40); // 当前平均值: 30 → 平均值队列: [15,20,30]
    expect(average.smoothValue()).toBeCloseTo(21.666666666666668, 3);
  });

  it('无数据时应返回0', () => {
    const average = new Average();
    expect(average.smoothValue()).toBe(0);
  });
});

describe('边界条件', () => {
  it('空队列时应返回0', () => {
    const average = new Average();
    expect(average.value()).toBe(0);
  });

  it('队列长度为1时应立即返回最新值', () => {
    const average = new Average(1);
    average.add(10);
    average.add(20);
    expect(average.value()).toBe(20);
  });

  it('添加非数值时应报错（需扩展类型检查）', () => {
    const average = new Average();
    // @ts-expect-error 测试错误输入
    expect(() => average.add('invalid')).toThrow();
  });
});