import { debounce } from '../src/utils/DeBounce';

describe('防抖函数测试', () => {
  // 使用jest的定时器模拟
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('默认延迟时间应为1000毫秒', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn);

    // 第一次调用
    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    // 快进500毫秒
    jest.advanceTimersByTime(500);
    expect(mockFn).not.toHaveBeenCalled();

    // 快进到1000毫秒
    jest.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('应使用自定义延迟时间', () => {
    const mockFn = jest.fn();
    const delay = 2000;
    const debouncedFn = debounce(mockFn, delay);

    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    // 快进1999毫秒
    jest.advanceTimersByTime(1999);
    expect(mockFn).not.toHaveBeenCalled();

    // 再快进1毫秒
    jest.advanceTimersByTime(1);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('快速多次调用应只执行最后一次', () => {
    const mockFn = jest.fn();
    const delay = 1000;
    const debouncedFn = debounce(mockFn, delay);

    // 模拟快速连续调用3次
    debouncedFn();
    debouncedFn();
    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    // 快进1000毫秒
    jest.advanceTimersByTime(1000);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('多次调用但间隔超过延迟时间应执行多次', () => {
    const mockFn = jest.fn();
    const delay = 500;
    const debouncedFn = debounce(mockFn, delay);

    // 第一次调用
    debouncedFn();
    jest.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 第二次调用
    debouncedFn();
    jest.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('应在正确的时间点执行函数', () => {
    const mockFn = jest.fn();
    const delay = 300;
    const debouncedFn = debounce(mockFn, delay);

    // 使用jest.spyOn来mock Date.now
    const spyNow = jest.spyOn(Date, 'now').mockImplementation(() => 0);

    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    // 快进299毫秒
    spyNow.mockImplementation(() => 299);
    jest.advanceTimersByTime(299);
    expect(mockFn).not.toHaveBeenCalled();

    // 快进1毫秒
    spyNow.mockImplementation(() => 300);
    jest.advanceTimersByTime(1);
    expect(mockFn).toHaveBeenCalledTimes(1);

    // 清理spy
    spyNow.mockRestore();
  });
});

describe('防抖函数测试（支持参数版本）', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  // 基础功能测试
  it('应在延迟后执行函数', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 500);

    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(499);
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  // 参数传递测试
  it('应正确传递参数', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn);

    debouncedFn('a', 1);
    jest.runAllTimers();

    expect(mockFn).toHaveBeenCalledWith('a', 1);
  });

  // 多次调用测试
  it('快速多次调用应只执行最后一次', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 200);

    debouncedFn('call1');
    debouncedFn('call2');
    debouncedFn('call3');

    jest.runAllTimers();
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('call3');
  });

  // 不同参数测试
  it('应保留最后一次调用的参数', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn);

    debouncedFn(1);
    debouncedFn(2);
    debouncedFn(3);

    jest.runAllTimers();
    expect(mockFn).toHaveBeenLastCalledWith(3);
  });

  // 默认延迟测试
  it('应使用默认1000ms延迟', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn);

    debouncedFn();
    jest.advanceTimersByTime(999);
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  // 自定义延迟测试
  it('应使用自定义延迟时间', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn();
    jest.advanceTimersByTime(299);
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  // 异步场景测试
  it('应正确处理连续异步调用', async () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    const asyncCall = () => {
      debouncedFn('async');
    };

    asyncCall();
    await Promise.resolve();
    asyncCall();
    await Promise.resolve();
    asyncCall();

    jest.runAllTimers();
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('async');
  });
});