import { boolValue, formatBracket, mask, setNodeId } from "../src/utils/StringHelper";
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