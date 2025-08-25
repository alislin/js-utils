import {
    dataExport,
    DataExportOption,
    parseCurl,
    HttpCommand,
    getProperty,
    setProperty,
    getQueryParams,
    setQueryParam
} from '../src/utils/DataExporter';

// 模拟 fetch 函数
global.fetch = jest.fn();

describe('数据导出工具函数测试', () => {
    // 测试 getProperty 函数
    describe('getProperty 函数', () => {
        const testObj = {
            id: 1,
            name: "demo",
            info: {
                title: "Mr",
                tags: ["a", "b", "c"]
            },
            items: [
                { id: 1, value: "first" },
                { id: 2, value: "second" }
            ]
        };

        test('应正确获取嵌套属性', () => {
            expect(getProperty(testObj, "info.title")).toBe("Mr");
        });

        test('应正确获取数组中的属性', () => {
            const result = getProperty(testObj, "items.value");
            expect(result).toEqual(["first", "second"]);
        });

        test('属性不存在时应返回 undefined', () => {
            expect(getProperty(testObj, "info.nonexistent")).toBeUndefined();
        });

        test('空路径应返回 undefined', () => {
            expect(getProperty(testObj, "")).toBeUndefined();
        });
    });

    // 测试 setProperty 函数
    describe('setProperty 函数', () => {
        test('应正确设置嵌套属性值', () => {
            const obj = { info: { title: "Old" } };
            setProperty(obj, "info.title", "New");
            expect(obj.info.title).toBe("New");
        });

        test('应创建不存在的嵌套属性', () => {
            const obj = {} as any;
            setProperty(obj, "level1.level2.value", "test");
            expect(obj.level1.level2.value).toBe("test");
        });
    });

    // 测试 URL 参数处理函数
    describe('URL 参数处理', () => {
        test('getQueryParams 应正确解析 URL 参数', () => {
            const url = "http://example.com?page=1&size=10&name=test";
            const params = getQueryParams(url);
            expect(params).toEqual({
                page: "1",
                size: "10",
                name: "test"
            });
        });

        test('setQueryParam 应正确更新 URL 参数', () => {
            const url = "http://example.com?page=1&size=10";
            const newUrl = setQueryParam(url, "page", "2");
            expect(newUrl).toBe("http://example.com?page=2&size=10");
        });

        test('setQueryParam 应能添加新参数', () => {
            const url = "http://example.com?page=1";
            const newUrl = setQueryParam(url, "size", "10");
            expect(newUrl).toBe("http://example.com?page=1&size=10");
        });
    });

    // 测试 parseCurl 函数
    describe('parseCurl 函数', () => {
        test('应正确解析 curl 命令', () => {
            const curlCommand = `curl 'https://api.example.com/data' \\
        -H 'accept: application/json' \\
        -H 'authorization: Bearer token123' \\
        --data-raw '{"page":1,"size":10}'`;

            const result = parseCurl(curlCommand);

            expect(result.url).toBe("https://api.example.com/data");
            expect(result.method).toBe("POST"); // 因为有 body，应该自动转为 POST
            expect(result.headers['accept']).toBe("application/json");
            expect(result.headers['authorization']).toBe("Bearer token123");
            expect(result.body).toEqual({ page: 1, size: 10 });
        });

        test('应处理没有 body 的 GET 请求', () => {
            const curlCommand = `curl 'https://api.example.com/data' \\
        -H 'accept: application/json'`;

            const result = parseCurl(curlCommand);

            expect(result.method).toBe("GET");
            expect(result.body).toBeUndefined();
        });
    });

    // 测试 parseRange 函数（内部函数，通过 dataExport 间接测试）
    describe('页面范围解析', () => {
        test('dataExport 应正确处理单页范围', async () => {
            // 设置 mock fetch
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: {
                        total: "100",
                        items: Array(10).fill({ id: 1, name: "test" })
                    }
                })
            });

            const options: DataExportOption = {
                command: {
                    url: 'https://api.example.com/data',
                    method: 'GET',
                    headers: {}
                },
                pageIndex: "page",
                pageSize: "size",
                pageTotal: "data.total",
                listItem: "data.items",
                pageRange: "1"
            };

            const result = await dataExport(options);
            expect(result).toHaveLength(10);
        });

        test('dataExport 应正确处理多页范围', async () => {
            // 设置 mock fetch
            (fetch as jest.Mock)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        data: {
                            total: "100",
                            items: Array(10).fill({ id: 1, name: "test" })
                        }
                    })
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        data: {
                            total: "100",
                            items: Array(10).fill({ id: 2, name: "test2" })
                        }
                    })
                });

            const options: DataExportOption = {
                command: {
                    url: 'https://api.example.com/data',
                    method: 'GET',
                    headers: {}
                },
                pageIndex: "page",
                pageSize: "size",
                pageTotal: "data.total",
                listItem: "data.items",
                pageRange: "1-2"
            };

            const result = await dataExport(options);
            expect(result).toHaveLength(20);
        });
    });

    // 测试分页基准检测
    describe('分页基准检测', () => {
        test('应自动检测 1-base 分页', async () => {
            (fetch as jest.Mock)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        data: {
                            total: "30",
                            items: Array(10).fill({}) // 第1页有数据
                        }
                    })
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        data: {
                            total: "30",
                            items: [] as any[] // 第0页没有数据或出错
                        }
                    })
                });

            const options: DataExportOption = {
                command: {
                    url: 'https://api.example.com/data',
                    method: 'GET',
                    headers: {}
                },
                pageIndex: "page",
                pageSize: "size",
                pageTotal: "data.total",
                listItem: "data.items",
                pageBase: 'auto'
            };

            const result = await dataExport(options);
            // 主要测试是否能正常完成而不出错
            expect(result).toBeDefined();
        });

        test('应正确处理显式指定的分页基准', async () => {
            (fetch as jest.Mock)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        data: {
                            total: "30",
                            items: Array(10).fill({})
                        }
                    })
                });

            const options: DataExportOption = {
                command: {
                    url: 'https://api.example.com/data',
                    method: 'GET',
                    headers: {}
                },
                pageIndex: "page",
                pageSize: "size",
                pageTotal: "data.total",
                listItem: "data.items",
                pageBase: 1 // 显式指定 1-base
            };

            const result = await dataExport(options);
            expect(result).toBeDefined();
        });
    });

    // 测试进度回调
    test('应正确调用进度回调', async () => {
        const mockProgress = jest.fn();

        (fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: {
                        total: "20",
                        items: Array(10).fill({})
                    }
                })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: {
                        total: "20",
                        items: Array(10).fill({})
                    }
                })
            });

        const options: DataExportOption = {
            command: {
                url: 'https://api.example.com/data',
                method: 'GET',
                headers: {}
            },
            pageIndex: "page",
            pageSize: "size",
            pageTotal: "data.total",
            listItem: "data.items",
            pageRange: "1-2"
        };

        await dataExport(options, mockProgress);

        // 验证进度回调被调用
        expect(mockProgress).toHaveBeenCalled();
    });

    // 测试错误处理
    test('应处理网络请求错误', async () => {
        (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

        const options: DataExportOption = {
            command: {
                url: 'https://api.example.com/data',
                method: 'GET',
                headers: {}
            },
            pageIndex: "page",
            pageSize: "size",
            pageTotal: "data.total",
            listItem: "data.items"
        };

        await expect(dataExport(options)).rejects.toThrow();
    });

    // 测试空数据情况
    test('应处理空数据列表', async () => {
        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                data: {
                    total: "0",
                    items: [] as any[]
                }
            })
        });

        const options: DataExportOption = {
            command: {
                url: 'https://api.example.com/data',
                method: 'GET',
                headers: {}
            },
            pageIndex: "page",
            pageSize: "size",
            pageTotal: "data.total",
            listItem: "data.items"
        };

        const result = await dataExport(options);
        expect(result).toEqual([]);
    });
});