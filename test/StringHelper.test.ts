import { formatBracket, setNodeId } from "../src/utils/StringHelper";
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