import { boolValue, formatBracket, mask, parseCSV, setNodeId } from "../src/utils/StringHelper";
// import { describe, expect, test } from '@jest/globals';

test("seed id test", () => {
    expect(setNodeId("t")).toBe("t");
    expect(setNodeId("t", "x")).toBe("t@x");
    expect(setNodeId("t", "x", "y")).toBe("t@x@y");
    expect(setNodeId("t", "x", "y", "z")).toBe("t@x@y@z");
    expect(setNodeId("t", undefined, "y", "z")).toBe("t@y@z");
    expect(setNodeId(undefined, "x", "y")).toBe("x@y");
    expect(setNodeId("t", "x@a")).toBe("t@x@a");
    expect(setNodeId("t", "x@a", "y", "z")).toBe("t@x@a@y@z");
});

describe('formatBracket function', () => {
    const tag = "message";
    // 基础功能测试
    test('普通中文括号处理', () => {
        const input = "测试（括号内容）";
        const expected = "测试（<message>括号内容</message>）";
        expect(formatBracket(input, tag)).toBe(expected);
    });

    test('普通英文括号处理', () => {
        const input = "测试(括号内容)";
        const expected = "测试(<message>括号内容</message>)";
        expect(formatBracket(input, tag)).toBe(expected);
    });

    test('方括号处理', () => {
        const input = "测试[括号内容]";
        const expected = "测试[<message>括号内容</message>]";
        expect(formatBracket(input, tag)).toBe(expected);
    });

    // 嵌套括号测试
    test('嵌套相同类型括号', () => {
        const input = "测试（外层（内层）内容）";
        const expected = "测试（<message>外层（<message>内层</message>）内容</message>）";
        expect(formatBracket(input, tag)).toBe(expected);
    });

    test('混合嵌套括号不匹配', () => {
        const input = "测试（外层[内层]内容）";
        const expected = "测试（<message>外层[<message>内层</message>]内容</message>）";
        expect(formatBracket(input, tag)).toBe(expected);
    });

    // HTML标签处理测试
    test('跳过HTML标签属性中的括号', () => {
        const input = '<span title="项目(不应处理)">（应处理）</span>';
        const expected = '<span title="项目(不应处理)">（<message>应处理</message>）</span>';
        expect(formatBracket(input, tag)).toBe(expected);
    });

    test('复杂HTML标签处理', () => {
        const input = '点击<a href="page.html?id=(123)">这里（链接）</a>了解更多';
        const expected = '点击<a href="page.html?id=(123)">这里（<message>链接</message>）</a>了解更多';
        expect(formatBracket(input, tag)).toBe(expected);
    });

    // 边界情况测试
    test('空括号', () => {
        const input = "空括号（）";
        const expected = "空括号（<message></message>）";
        expect(formatBracket(input, tag)).toBe(expected);
    });

    test('只有开括号', () => {
        const input = "只有开括号（没有闭合";
        const expected = "只有开括号（没有闭合";
        expect(formatBracket(input, tag)).toBe(expected);
    });

    test('只有闭括号', () => {
        const input = "只有闭括号）没有开）";
        const expected = "只有闭括号）没有开）";
        expect(formatBracket(input, tag)).toBe(expected);
    });

    test('混合括号类型', () => {
        const input = "混合[括号(测试）内容]";
        const expected = "混合[<message>括号(测试）内容</message>]";
        expect(formatBracket(input, tag)).toBe(expected);
    });

    test('相邻括号组', () => {
        const input = "（1）（2）（3）";
        const expected = "（<message>1</message>）（<message>2</message>）（<message>3</message>）";
        expect(formatBracket(input, tag)).toBe(expected);
    });

    // 实际业务场景测试
    test('业务场景1', () => {
        const input = "张霞 为 李睿喆了 发放 优惠券（学校：洪湖天立学校/洪湖天立学校-高中部,名称：双子女减免,学年：2024,金额：500.00，状态：未使用）";
        const expected = "张霞 为 李睿喆了 发放 优惠券（<message>学校：洪湖天立学校/洪湖天立学校-高中部,名称：双子女减免,学年：2024,金额：500.00，状态：未使用</message>）";
        expect(formatBracket(input, tag)).toBe(expected);
    });

    test('业务场景2', () => {
        const input = "SYSTEM 添加了 李睿喆 的支付单（单号：<a data-target=\"pay_order\" data-id=\"cuk1i9soqock7brvenb0\">SK39G-202502-000831</a>，金额：21300，收费方式：[[在线支付:1400], [在线支付:15700], [在线支付:4200]]）";
        const expected = "SYSTEM 添加了 李睿喆 的支付单（<message>单号：<a data-target=\"pay_order\" data-id=\"cuk1i9soqock7brvenb0\">SK39G-202502-000831</a>，金额：21300，收费方式：[<message>[<message>在线支付:1400</message>], [<message>在线支付:15700</message>], [<message>在线支付:4200</message>]</message>]）</message>）";
        expect(formatBracket(input, tag)).toBe(expected);
    });
});

describe('mask function', () => {
    // 1. 基本功能测试
    test('基本掩码功能', () => {
        expect(mask("1234567890", "##******##")).toBe("12******90");
        expect(mask("ABCDEFGHIJ", "###****###")).toBe("ABC****HIJ");
    });

    // 2. 自定义掩码字符测试
    test('使用自定义掩码字符', () => {
        expect(mask("1234567890", "##******##", "left", "*", "X")).toBe("12XXXXXX90");
        expect(mask("secret", "**####", "left", "*", "?")).toBe("??cret");
    });

    // 3. 填充模式测试
    test('模板长度不足时的填充', () => {
        // 填充模式为*（默认）
        expect(mask("12345678", "##**")).toBe("12******");
        // 填充模式为#
        expect(mask("12345678", "##**", "left", "#")).toBe("12**5678");
    });

    // 4. 对齐方式测试
    test('不同对齐方式', () => {
        // 左对齐（默认）
        expect(mask("12345", "###", "left", "*", "*")).toBe("123**");
        // 右对齐
        expect(mask("12345", "###", "right", "*", "*")).toBe("**345");
        expect(mask("123456", "#**##", "right", "*", "X")).toBe("X2XX56");
        expect(mask("123456", "#**##", "right", "#", "X")).toBe("12XX56");
    });

    // 5. 边界情况测试
    test('边界情况处理', () => {
        // 空字符串
        expect(mask("", "####")).toBe("");
        // 模板全为#
        expect(mask("1234", "####")).toBe("1234");
        // 模板全为*
        expect(mask("1234", "****", "left", "*", "X")).toBe("XXXX");
        // 源字符串短于模板
        expect(mask("12", "####****")).toBe("12");
        expect(mask("12", "####****", "right")).toBe("**");
    });

    // 6. 特殊字符测试
    test('特殊字符处理', () => {
        expect(mask("中文测试", "##**", "left", "*", "X")).toBe("中文XX");
        expect(mask("a1b2c3", "#*#*#*")).toBe("a*b*c*");
    });

    // 7. 非法模板测试
    test('非法模板字符', () => {
        // 模板包含非#*字符（根据实现可能会被忽略或处理）
        expect(mask("123456", "##a**##")).toBe("12***6");
        expect(mask("123456", "##a**##", "left", "#")).toBe("123**6");
        expect(mask("123456", "##?**##", "right")).toBe("1***56");
        expect(mask("123456", "##?**##", "right", "#")).toBe("12**56");
    });
});

describe('boolValue 方法测试', () => {
    // 测试空值情况
    test('空值应返回 false', () => {
        expect(boolValue(null)).toBe(false);      // null
        expect(boolValue(undefined)).toBe(false); // undefined
        expect(boolValue('')).toBe(false);        // 空字符串
    });

    // 测试 boolean 情况
    test('测试 boolean 情况', () => {
        expect(boolValue(true)).toBe(true);      // true
        expect(boolValue(false)).toBe(false); // false
    });

    // 测试默认的 true 值（不区分大小写）
    test('默认 true 值应返回 true', () => {
        expect(boolValue('true')).toBe(true);     // 小写
        expect(boolValue('TRUE')).toBe(true);     // 大写
        expect(boolValue('1')).toBe(true);        // 数字1
        expect(boolValue('yes')).toBe(true);      // yes
        expect(boolValue('YES')).toBe(true);      // YES
        expect(boolValue('y')).toBe(true);       // y
        expect(boolValue('on')).toBe(true);       // on
        expect(boolValue('ON')).toBe(true);      // ON
    });

    // 测试非 true 值
    test('非 true 值应返回 false', () => {
        expect(boolValue('false')).toBe(false);   // false
        expect(boolValue('0')).toBe(false);       // 0
        expect(boolValue('no')).toBe(false);      // no
        expect(boolValue('off')).toBe(false);     // off
        expect(boolValue('random')).toBe(false);  // 随机字符串
    });

    // 测试字符串首尾空格处理
    test('应自动去除首尾空格', () => {
        expect(boolValue(' true ')).toBe(true);   // 带空格
        expect(boolValue(' 1 ')).toBe(true);      // 带空格
        expect(boolValue(' yes ')).toBe(true);    // 带空格
    });

    // 测试自定义 trueKeys
    test('应支持自定义 trueKeys', () => {
        const customTrueKeys = ['enabled', 'active', 'ok'];

        // 自定义值应返回 true
        expect(boolValue('enabled', customTrueKeys)).toBe(true);
        expect(boolValue('active', customTrueKeys)).toBe(true);
        expect(boolValue('ok', customTrueKeys)).toBe(true);

        // 默认值在自定义模式下应返回 false
        expect(boolValue('true', customTrueKeys)).toBe(false);
        expect(boolValue('yes', customTrueKeys)).toBe(false);

        // 其他值应返回 false
        expect(boolValue('disabled', customTrueKeys)).toBe(false);
    });
});

describe('CSV解析器测试', () => {
    describe('基本功能测试', () => {
        test('应该正确解析简单的CSV数据', () => {
            const csv = `name,age,city
张三,25,北京
李四,30,上海`;

            const result = parseCSV(csv);
            expect(result).toEqual([
                { name: '张三', age: '25', city: '北京' },
                { name: '李四', age: '30', city: '上海' }
            ]);
        });

        test('应该处理空字符串输入', () => {
            const result = parseCSV('');
            expect(result).toEqual([]);
        });

        test('应该处理只包含空白字符的输入', () => {
            const result = parseCSV('   \n  \r\n  ');
            expect(result).toEqual([]);
        });
    });

    describe('自定义列名测试', () => {
        test('应该使用自定义列名', () => {
            const csv = `张三,25,北京
李四,30,上海`;

            const result = parseCSV(csv, { columnNames: ['姓名', '年龄', '城市'] });
            expect(result).toEqual([
                { 姓名: '张三', 年龄: '25', 城市: '北京' },
                { 姓名: '李四', 年龄: '30', 城市: '上海' }
            ]);
        });

        test('应该使用序号作为列名', () => {
            const csv = `张三,25,北京
李四,30,上海`;

            const result = parseCSV(csv, { columnNames: [] });
            expect(result).toEqual([
                { column_0: '张三', column_1: '25', column_2: '北京' },
                { column_0: '李四', column_1: '30', column_2: '上海' }
            ]);
        });
    });

    describe('自定义分隔符测试', () => {
        test('应该使用自定义分隔符', () => {
            const csv = `name|age|city
张三|25|北京
李四|30|上海`;

            const result = parseCSV(csv, { delimiter: '|' });
            expect(result).toEqual([
                { name: '张三', age: '25', city: '北京' },
                { name: '李四', age: '30', city: '上海' }
            ]);
        });
    });

    describe('多行数据支持测试', () => {
        test('默认不支持多行数据', () => {
            const csv = `"姓名","描述"
"张三","这是一个
多行描述"
"李四","单行描述"`;

            const result = parseCSV(csv);
            // 默认行为：不支持多行，按行分割处理
            expect(result).toEqual([
                { 姓名: '张三', 描述: '这是一个' },
                { 姓名: '多行描述"', 描述: '' },
                { 姓名: '李四', 描述: '单行描述' }
            ]);
        });

        test('明确设置不支持多行数据', () => {
            const csv = `"姓名","描述"
"张三","这是一个
多行描述"
"李四","单行描述"`;

            const result = parseCSV(csv, { supportMultiline: false });
            expect(result).toEqual([
                { 姓名: '张三', 描述: '这是一个' },
                { 姓名: '多行描述"', 描述: '' },
                { 姓名: '李四', 描述: '单行描述' }
            ]);
        });

        test('支持多行数据', () => {
            const csv = `"姓名","描述"
"张三","这是一个
多行描述"
"李四","单行描述"`;

            const result = parseCSV(csv, { supportMultiline: true });
            expect(result).toEqual([
                { 姓名: '张三', 描述: '这是一个\n多行描述' },
                { 姓名: '李四', 描述: '单行描述' }
            ]);
        });

        test('支持多行数据的复杂情况', () => {
            const csv = `"姓名","详细信息"
"张三","地址：北京市朝阳区
电话：123456789
邮箱：zhangsan@example.com"
"李四","地址：上海市浦东新区
电话：987654321"`;

            const result = parseCSV(csv, { supportMultiline: true });
            expect(result).toEqual([
                {
                    姓名: '张三',
                    详细信息: '地址：北京市朝阳区\n电话：123456789\n邮箱：zhangsan@example.com'
                },
                {
                    姓名: '李四',
                    详细信息: '地址：上海市浦东新区\n电话：987654321'
                }
            ]);
        });
    });

    describe('引号和转义字符处理测试', () => {
        test('应该正确处理包含引号的字段', () => {
            const csv = `"姓名","年龄","城市"
"张三,李四","25","北,京"
"王五","30","上;海"`;

            const result = parseCSV(csv);
            expect(result).toEqual([
                { 姓名: '张三,李四', 年龄: '25', 城市: '北,京' },
                { 姓名: '王五', 年龄: '30', 城市: '上;海' }
            ]);
        });

        test('应该正确处理转义引号', () => {
            const csv = `"姓名","年龄"
"张三""李四","25"
"王""五","30"`;

            const result = parseCSV(csv);
            expect(result).toEqual([
                { 姓名: '张三"李四', 年龄: '25' },
                { 姓名: '王"五', 年龄: '30' }
            ]);
        });
    });
    describe('非标准行内容测试', () => {
        test('单行数据测试', () => {
            // 只有标题行
            const csv1 = `name,age,city`;
            const result1 = parseCSV(csv1);
            expect(result1).toEqual([]);

            // 只有数据行，使用自定义列名
            const csv2 = `张三,25,北京`;
            const result2 = parseCSV(csv2, { columnNames: ['姓名', '年龄', '城市'] });
            expect(result2).toEqual([
                { 姓名: '张三', 年龄: '25', 城市: '北京' }
            ]);

            // 只有一行数据，但没有自定义列名（应该使用该行作为数据）
            const csv3 = `张三,25,北京`;
            const result3 = parseCSV(csv3, { columnNames: [] });
            expect(result3).toEqual([
                { column_0: '张三', column_1: '25', column_2: '北京' }
            ]);
        });

        test('列名数组长度和内容长度不一致 - 内容少于列名', () => {
            const csv = `张三,25
李四,30`;

            const result = parseCSV(csv, { columnNames: ['姓名', '年龄', '城市', '国家'] });
            expect(result).toEqual([
                { 姓名: '张三', 年龄: '25', 城市: '', 国家: '' },
                { 姓名: '李四', 年龄: '30', 城市: '', 国家: '' }
            ]);
        });

        test('列名数组长度和内容长度不一致 - 内容多于列名', () => {
            const csv = `张三,25,北京,中国,亚洲
李四,30,上海,中国,亚洲`;

            const result = parseCSV(csv, { columnNames: ['姓名', '年龄'] });
            expect(result).toEqual([
                { 姓名: '张三', 年龄: '25' },
                { 姓名: '李四', 年龄: '30' }
            ]);
        });

        test('混合情况：部分行字段数不一致', () => {
            const csv = `姓名,年龄,城市,国家
张三,25,北京
李四,30,上海,中国,额外字段
王五`;

            const result = parseCSV(csv);
            expect(result).toEqual([
                { 姓名: '张三', 年龄: '25', 城市: '北京', 国家: '' },
                { 姓名: '李四', 年龄: '30', 城市: '上海', 国家: '中国' },
                { 姓名: '王五', 年龄: '', 城市: '', 国家: '' }
            ]);
        });

        test('空行和不完整行的处理', () => {
            const csv = `姓名,年龄,城市
张三,25,北京

李四,30
王五,,上海
,,
`;

            const result = parseCSV(csv);
            expect(result).toEqual([
                { 姓名: '张三', 年龄: '25', 城市: '北京' },
                { 姓名: '李四', 年龄: '30', 城市: '' },
                { 姓名: '王五', 年龄: '', 城市: '上海' },
            ]);
        });
    });

    describe('边界情况测试', () => {
        test('应该处理空字段', () => {
            const csv = `name,age,city
张三,,北京
,30,`;

            const result = parseCSV(csv);
            expect(result).toEqual([
                { name: '张三', age: '', city: '北京' },
                { name: '', age: '30', city: '' }
            ]);
        });

        test('应该处理字段数量不匹配的情况', () => {
            const csv = `name,age,city,country
张三,25,北京
李四,30,上海,中国`;

            const result = parseCSV(csv);
            expect(result).toEqual([
                { name: '张三', age: '25', city: '北京', country: '' },
                { name: '李四', age: '30', city: '上海', country: '中国' }
            ]);
        });

        test('应该处理只有一行数据的情况', () => {
            const csv = `name,age,city`;

            const result = parseCSV(csv);
            expect(result).toEqual([]);
        });

        test('应该处理只有一行数据但使用自定义列名的情况', () => {
            const csv = `张三,25,北京`;

            const result = parseCSV(csv, { columnNames: ['姓名', '年龄', '城市'] });
            expect(result).toEqual([
                { 姓名: '张三', 年龄: '25', 城市: '北京' }
            ]);
        });
    });

    describe('换行符处理测试', () => {
        test('应该处理Windows风格的换行符', () => {
            const csv = "name,age,city\r\n张三,25,北京\r\n李四,30,上海";

            const result = parseCSV(csv);
            expect(result).toEqual([
                { name: '张三', age: '25', city: '北京' },
                { name: '李四', age: '30', city: '上海' }
            ]);
        });

        test('应该处理Unix风格的换行符', () => {
            const csv = "name,age,city\n张三,25,北京\n李四,30,上海";

            const result = parseCSV(csv);
            expect(result).toEqual([
                { name: '张三', age: '25', city: '北京' },
                { name: '李四', age: '30', city: '上海' }
            ]);
        });

        test('应该处理Mac风格的换行符（多行支持模式）', () => {
            const csv = "name,age,city\r张三,25,北京\r李四,30,上海";

            const result = parseCSV(csv, { supportMultiline: true });
            expect(result).toEqual([
                { name: '张三', age: '25', city: '北京' },
                { name: '李四', age: '30', city: '上海' }
            ]);
        });
    });

    describe('中文支持测试', () => {
        test('应该正确处理中文字符', () => {
            const csv = `姓名,年龄,城市,爱好
张三,25,北京市,读书
李四,30,上海市,运动
王五,28,广州市,音乐`;

            const result = parseCSV(csv);
            expect(result).toEqual([
                { 姓名: '张三', 年龄: '25', 城市: '北京市', 爱好: '读书' },
                { 姓名: '李四', 年龄: '30', 城市: '上海市', 爱好: '运动' },
                { 姓名: '王五', 年龄: '28', 城市: '广州市', 爱好: '音乐' }
            ]);
        });

        test('应该处理包含特殊中文字符的数据', () => {
            const csv = `名称,描述
测试数据,包含中文标点符号：，。！？
特殊字符,包含英文符号:@#$%^&*()`;

            const result = parseCSV(csv);
            expect(result).toEqual([
                { 名称: '测试数据', 描述: '包含中文标点符号：，。！？' },
                { 名称: '特殊字符', 描述: '包含英文符号:@#$%^&*()' }
            ]);
        });
    });

    describe('性能和兼容性测试', () => {
        test('应该在大数据量时保持性能', () => {
            let csv = 'id,name,value\n';
            for (let i = 0; i < 1000; i++) {
                csv += `${i},名称${i},值${i}\n`;
            }

            const startTime = Date.now();
            const result = parseCSV(csv);
            const endTime = Date.now();

            expect(result.length).toBe(1000);
            expect(result[0]).toEqual({ id: '0', name: '名称0', value: '值0' });
            expect(result[999]).toEqual({ id: '999', name: '名称999', value: '值999' });
            // 性能测试：应该在合理时间内完成（这里设置为1秒，实际应该更快）
            expect(endTime - startTime).toBeLessThan(1000);
        });

        test('应该处理各种编码的CSV数据', () => {
            const csv = `姓名,年龄
张三,25
李四,30`;

            // 测试不同编码的字符串
            const utf8Csv = Buffer.from(csv, 'utf8').toString('utf8');
            const result = parseCSV(utf8Csv);

            expect(result).toEqual([
                { 姓名: '张三', 年龄: '25' },
                { 姓名: '李四', 年龄: '30' }
            ]);
        });
    });
    describe('异常情况测试', () => {
        test('处理不规则的CSV格式', () => {
            const csv = `姓名,年龄,城市
"张三",25,北京
李四,"30,特殊年龄",上海
"王五
换行用户",28,广州`;

            // 不支持多行时的行为
            const result1 = parseCSV(csv, { supportMultiline: false });
            expect(result1).toEqual([
                { 姓名: '张三', 年龄: '25', 城市: '北京' },
                { 姓名: '李四', 年龄: '30,特殊年龄', 城市: '上海' },
                { 姓名: '王五', 年龄: '', 城市: '' },
                { 姓名: '换行用户"', 年龄: '28', 城市: '广州' }
            ]);

            // 支持多行时的行为
            const result2 = parseCSV(csv, { supportMultiline: true });
            expect(result2).toEqual([
                { 姓名: '张三', 年龄: '25', 城市: '北京' },
                { 姓名: '李四', 年龄: '30,特殊年龄', 城市: '上海' },
                { 姓名: '王五\n换行用户', 年龄: '28', 城市: '广州' }
            ]);
        });

        test('处理包含特殊字符的字段', () => {
            const csv = `"字段1","字段2","字段3"
"包含""引号""的文本","包含,逗号的文本","包含
换行符的文本"
"正常文本","另一个""引号""测试","最后一个字段"`;

            const result = parseCSV(csv, { supportMultiline: true });
            expect(result).toEqual([
                {
                    字段1: '包含"引号"的文本',
                    字段2: '包含,逗号的文本',
                    字段3: '包含\n换行符的文本'
                },
                {
                    字段1: '正常文本',
                    字段2: '另一个"引号"测试',
                    字段3: '最后一个字段'
                }
            ]);
        });
    });
});