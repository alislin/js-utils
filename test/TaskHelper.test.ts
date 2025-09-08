import { wait } from '../src/utils/TaskHelper';

describe('wait function', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    test('应该立即解析当同步条件初始为true', async () => {
        const condition = jest.fn().mockReturnValue(true);
        
        const promise = wait(condition);
        await Promise.resolve();
        
        expect(condition).toHaveBeenCalledTimes(1);
        await expect(promise).resolves.toBeUndefined();
    });

    test('应该立即解析当异步条件初始为true', async () => {
        const condition = jest.fn().mockResolvedValue(true);
        
        const promise = wait(condition);
        await Promise.resolve();
        
        expect(condition).toHaveBeenCalledTimes(1);
        await expect(promise).resolves.toBeUndefined();
    });

    test('应该在同步条件变为true时解析', async () => {
        let callCount = 0;
        const condition = jest.fn(() => {
            callCount++;
            return callCount >= 3;
        });

        const promise = wait(condition, 100);
        
        // 第一次检查
        await Promise.resolve();
        expect(condition).toHaveBeenCalledTimes(1);
        
        // 第二次检查
        jest.advanceTimersByTime(100);
        await Promise.resolve();
        expect(condition).toHaveBeenCalledTimes(2);
        
        // 第三次检查（条件为true）
        jest.advanceTimersByTime(100);
        await Promise.resolve();
        expect(condition).toHaveBeenCalledTimes(3);
        
        await expect(promise).resolves.toBeUndefined();
    });

    test('应该在异步条件变为true时解析', async () => {
        let callCount = 0;
        const condition = jest.fn(async () => {
            callCount++;
            return callCount >= 3;
        });

        const promise = wait(condition, 100);
        
        // 第一次检查
        await Promise.resolve();
        expect(condition).toHaveBeenCalledTimes(1);
        
        // 第二次检查
        jest.advanceTimersByTime(100);
        await Promise.resolve();
        expect(condition).toHaveBeenCalledTimes(2);
        
        // 第三次检查（条件为true）
        jest.advanceTimersByTime(100);
        await Promise.resolve();
        expect(condition).toHaveBeenCalledTimes(3);
        
        await expect(promise).resolves.toBeUndefined();
    });

    test('应该处理同步条件函数抛出异常', async () => {
        let callCount = 0;
        const condition = jest.fn(() => {
            callCount++;
            if (callCount === 2) {
                throw new Error('测试错误');
            }
            return callCount >= 3;
        });

        const promise = wait(condition, 100);
        
        // 第一次检查
        await Promise.resolve();
        
        // 第二次检查（抛出异常）
        jest.advanceTimersByTime(100);
        await Promise.resolve();
        
        // 第三次检查（条件为true）
        jest.advanceTimersByTime(100);
        await Promise.resolve();
        
        await expect(promise).resolves.toBeUndefined();
        expect(condition).toHaveBeenCalledTimes(3);
    });

    test('应该处理异步条件函数拒绝', async () => {
        let callCount = 0;
        const condition = jest.fn(async () => {
            callCount++;
            if (callCount === 2) {
                throw new Error('测试错误');
            }
            return callCount >= 3;
        });

        const promise = wait(condition, 100);
        
        // 第一次检查
        await Promise.resolve();
        
        // 第二次检查（拒绝）
        jest.advanceTimersByTime(100);
        await Promise.resolve();
        
        // 第三次检查（条件为true）
        jest.advanceTimersByTime(100);
        await Promise.resolve();
        
        await expect(promise).resolves.toBeUndefined();
        expect(condition).toHaveBeenCalledTimes(3);
    });

    // test('应该使用默认间隔时间100ms', async () => {
    //     const condition = jest.fn().mockReturnValue(false);
        
    //     const promise = wait(condition);
        
    //     // 立即检查后，应该设置100ms的间隔
    //     jest.advanceTimersByTime(100);
    //     await Promise.resolve();
        
    //     expect(condition).toHaveBeenCalledTimes(2);
    // });

    // test('应该使用自定义间隔时间', async () => {
    //     const condition = jest.fn().mockReturnValue(false);
    //     const customDelay = 200;
        
    //     const promise = wait(condition, customDelay);
        
    //     jest.advanceTimersByTime(200);
    //     await Promise.resolve();
        
    //     expect(condition).toHaveBeenCalledTimes(2);
    // });

    test('应该处理混合同步和异步条件', async () => {
        let callCount = 0;
        const condition = jest.fn(() => {
            callCount++;
            if (callCount === 1) {
                return false; // 同步
            } else if (callCount === 2) {
                return Promise.resolve(false); // 异步
            } else {
                return true; // 同步
            }
        });

        const promise = wait(condition, 100);
        
        // 第一次检查（同步）
        await Promise.resolve();
        
        // 第二次检查（异步）
        jest.advanceTimersByTime(100);
        await Promise.resolve();
        
        // 第三次检查（同步true）
        jest.advanceTimersByTime(100);
        await Promise.resolve();
        
        await expect(promise).resolves.toBeUndefined();
        expect(condition).toHaveBeenCalledTimes(3);
    });
});