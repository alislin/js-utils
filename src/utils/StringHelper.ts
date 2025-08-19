/*
 * @Author: Lin Ya
 * @Date: 2022-06-30 20:29:34
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-08-19 14:14:47
 * @Description: string 帮助方法
 */

const ID_SEED_LENGNT = 5;
const OFFSET = Math.pow(10, ID_SEED_LENGNT - 1);
const ID_SEED_MARK = "@";

/**
 * 返回字符串（null值转换为空串）
 * @param value 字符串
 * @returns 字符串
 */
export function stringValue(value: string): string {
    if (isEmpty(value)) {
        return "";
    }
    return value;
}

/**
 * 判断字符串是否为空或者空字串
 * @param value 字符串
 * @returns 是否为空
 */
export function isEmpty(value?: string | null): boolean {
    if (!value || value === undefined || value === null || value === "") {
        return true;
    }
    return false;
}

/**
 * 获取请求字串
 * @param value 参数对象
 * @returns 请求字串
 */
export function urlParameter(value: any): string {
    let result = "";
    if (!value || value === null || value === undefined) {
        return result;
    }
    let index = 0;
    for (let key in value) {
        let v = value[key];
        if (v && v !== null && !isEmpty(v)) {
            let param = key + "=" + v;
            if (!isEmpty(param)) {
                if (index > 0) {
                    result += "&";
                }
                result += param;
            }
            index++;
        }
    }
    return result;
}

/**
 * 生成随机字符串
 * @param length 输出长度
 * @param src 使用的字符列表（默认使用数字和小写字母）
 * @returns 随机字串
 */
export function randomString(length: number, src?: string): string {
    let template = "1234567890abcdefghijklmnopqrstuvwxyz";
    let t = template;
    if (src && !isEmpty(src)) {
        t = src;
    }

    let t_len = t.length - 1;
    let result = "";
    for (let i = 1; i < length; i++) {
        let index = Math.round(Math.random() * t_len);
        let mark = <string>t.substring(index, index + 1);
        result += mark;

    }
    return result;
}

// #region Node Id 处理
/**
 * 创建唯一标识Id
 * @param id 原始id
 * @param seeds 添加字串（如果为空，则添加随机字符）
 * @returns 增加随机字符的id
 */
export function setNodeId(id?: string, ...seeds: (string | undefined)[]) {
    let mark = <string><unknown>Math.round(Math.random() * OFFSET + OFFSET);

    const list = [id, ...seeds].filter(x => !isEmpty(x));
    return list.join(ID_SEED_MARK);

    // if (seeds.length > 0) {
    //     let seed = seeds[0];
    //     for (let i = 1; i < seeds.length; i++) {
    //         const item = seeds[i];
    //         if (!isEmpty(item)) {
    //             seed += ID_SEED_MARK + item;
    //         }
    //     }
    //     mark = seed ?? mark;
    // }

    // if (isEmpty(id)) return mark;
    // return id + ID_SEED_MARK + mark;
}

/**
 * 获取原始id（移除随机字符）
 * @param id 带随机字符的id
 * @returns 原始id
 */
export function getNodeId(id?: string) {
    if (!id || isEmpty(id)) {
        return id ?? "";
    }
    // 检查分隔符
    let index = id.toString().indexOf(ID_SEED_MARK);
    if (index < 0) {
        return id;
    }

    return id.substring(0, index);
}

/**
 * 获取id种的附加字符
 * @param id 带附加字符的id
 * @returns 附加字符
 */
export function getNodeSeed(id: string) {
    if (isEmpty(id)) {
        return id;
    }
    // 检查分隔符
    let index = id.toString().indexOf(ID_SEED_MARK);
    if (index < 0) {
        return "";
    }

    return id.toString().substring(index + 1);
}

/**
 * 将多节点id拆分为id列表
 * @param id 带附加字符的id
 * @returns id列表
 */
export function getNodeIdList(id: string) {
    let result = [] as string[];
    if (isEmpty(id)) return result;

    result = id.toString().split(ID_SEED_MARK);
    return result;
}
// #endregion

/**
 * 字符串转换
 * @param value 
 * @returns 字符串转换
 */
export function toStr(value: any) {
    return <string>value;
}

/**
 * 判断是否为数字
 * @param value 输入参数
 * @returns 是否为数字
 */
export function isNumber(value: string | number): boolean {
    return ((value !== null) &&
        (value !== '') &&
        !isNaN(Number(value.toString())));
}

/**
 * 检查是否整数
 * @param value 输入值
 * @returns 结果
 */
export function isInteger(value: number): boolean {
    return Number(value) === Math.round(value);
}

/**
 * 转换为数字
 * @param value 
 * @returns 数字
 */
export function toNumber(value: any) {
    if (isNumber(value)) return Number(value.toString());
    return 0;
}

// #region 日期处理
/**
 * 将日期转换为毫秒值
 * @param date 日期
 * @returns 毫秒值
 */
export function getTimeNumber(date?: Date | string | number) {
    if (!date) {
        return 0;
    }
    let d = new Date(date);
    return d.getTime();
}

/**
 * 获取日期字串
 * @param date 日期
 * @returns 日期字串 (eg: 2022-08-07)
 */
export function getDate(date?: Date | string | number, split: string = "-"): string | undefined {
    if (date) {

        let d = new Date(date);

        const option = {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        } as Intl.DateTimeFormatOptions;
        let result = d.toLocaleDateString("zh-CN", option).replace(/\//g, split);

        return result;
    }
    return undefined;
}

/**
 * 获取时间字串
 * @param date 日期
 * @returns 时间字串 (eg: 2022-08-07)
 */
export function getTime(date?: Date | string | number, split: string = "-"): string | undefined {
    if (date) {

        let d = new Date(date);

        const option = {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        } as Intl.DateTimeFormatOptions;
        let result = d.toLocaleDateString("zh-CN", option).replace(/\//g, split);

        return result;
    }
    return undefined;
}

/**
 * 按照时长自动转换为输出显示
 * @param n 时长（毫秒）
 * @returns 时长字串（eg: 2分31秒）
 */
export function formatTimestamp(n: number) {
    if (n < 1000) {
        return `${Math.floor(n)}毫秒`;
    } else if (n < 60 * 1000) {
        const seconds = Math.floor(n / 1000);
        return `${seconds}秒`;
    } else if (n < 60 * 60 * 1000) {
        const minutes = Math.floor(n / (60 * 1000));
        const seconds = Math.floor((n % (60 * 1000)) / 1000);
        return `${minutes}分${seconds}秒`;
    } else if (n < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(n / (60 * 60 * 1000));
        const minutes = Math.floor((n % (60 * 60 * 1000)) / (60 * 1000));
        return `${hours}小时${minutes}分`;
    } else {
        const days = Math.floor(n / (24 * 60 * 60 * 1000));
        const hours = Math.floor((n % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((n % (60 * 60 * 1000)) / (60 * 1000));
        return `${days}天${hours}小时${minutes}分`;
    }
}

/**
 * 返回时间对象
 * @param date 
 * @returns 
 */
export function toDate(date?: Date | string | number) {
    if (date) {
        let d = new Date(date);
        return d;
    }
    return undefined;
}

/**
 * 两个日期的时间差（毫秒）
 * @param date1 
 * @param date2 
 * @returns 时间差（毫秒）
 */
export function compareTime(date1: Date | string | number, date2: Date | string | number) {
    let d1 = new Date(date1);
    let d2 = new Date(date2);
    return d1.getTime() - d2.getTime();
}

/**
 * 返回 yyyy-MM-dd HH:mm:ss 字串
 * @param utc 
 * @returns 时间字串
 */
export function toDateTime(utc: number) {
    const d = new Date(utc);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
// #endregion

/**
 * 字符串列表转换为字符串
 * @param list 字符串列表
 * @returns 结果字串(换行分隔)
 */
export function listToStr(list?: string[], split?: string): string {
    let m = "";
    let sp = split ?? "\n";
    if (!list || list.length === 0) {
        return m;
    }
    let i = 0;
    list.forEach(x => {
        if (i !== 0) {
            m += sp;
        }
        m += x;
        i++;
    })
    return m;
}

/**
 * 按照换行转换为列表
 * @param str 字符串
 * @returns 列表
 */
export function strToList(str?: string): string[] {
    let n = str?.replace("\r", "");
    return n?.split("\n") ?? [];
}

export function splitText(str?: string, splitList?: string) {
    if (isEmpty(str)) return [];
    const sp = splitList ?? " ,;/\\|\n\t";
    const sp_regex = new RegExp(`[${sp}]`);
    const result = str!.split(sp_regex);
    return result;
}

export function fenToYuan(fen: number, fixed: boolean = false) {
    let v = (fen / 100.0);
    if (fixed) {
        v = <number><unknown>(v.toFixed(2));
        return v;
    }

    return v;
}

export function yuanToFen(value: number) {
    return value * 100;
}

// export async function structuralClone<T>(obj: T):Promise<T> {
//     let result = new Promise(resolve => {
//         const { port1, port2 } = new MessageChannel();
//         port2.onmessage = ev => resolve(ev.data);
//         port1.postMessage(obj);
//     });
//     return result as T;
// }


export function toDateValue(value: Date | string) {
    let d = new Date(value);
    let m = d.toISOString();
    return m.substring(0, 10);
}

export function toCharArray(value?: string): string[] {
    const list: string[] = [];
    if (!value) return list;
    for (let i = 0; i < value.length; i++) {
        list.push(value[i]);
    }
    return list;
}

/**
 * 生成雪花算法ID（Snowflake ID），一种分布式唯一ID生成算法
 * 
 * 雪花ID由以下部分组成：
 * - 时间戳（从自定义纪元开始的毫秒数）
 * - 数据中心ID
 * - 工作节点ID
 * - 序列号
 * 
 * 返回的ID是一个19位字符串，确保不以0开头
 * 
 * @param workerId 工作节点ID (默认: 1)
 * @param datacenterId 数据中心ID (默认: 1)
 * @returns 返回19位的字符串形式的雪花ID
 * 
 * @example
 * // 生成一个雪花ID
 * const id = generateSnowflakeId(1, 1);
 * console.log(id); // 输出类似 "1325624573249634304" 的19位数字字符串
 * 
 * @example
 * // 使用默认参数生成ID
 * const defaultId = generateSnowflakeId();
 * console.log(defaultId); // 使用默认workerId和datacenterId生成的ID
 */
export function generateSnowflakeId(workerId: number = 1, datacenterId: number = 1): string {
    // return "";

    const epoch = 1577836800000n; // Custom epoch (2020-01-01)
    let sequence = 0n;
    const sequenceBits = 12n;
    const workerIdBits = 5n;
    const datacenterIdBits = 5n;
    const maxWorkerId = -1n ^ (-1n << workerIdBits);
    const maxDatacenterId = -1n ^ (-1n << datacenterIdBits);
    const workerIdShift = sequenceBits;
    const datacenterIdShift = sequenceBits + workerIdBits;
    const timestampLeftShift = sequenceBits + workerIdBits + datacenterIdBits;
    const sequenceMask = -1n ^ (-1n << sequenceBits);
    let lastTimestamp = -1n;

    function tilNextMillis(lastTimestamp: bigint): bigint {
        let timestamp = BigInt(Date.now());
        while (timestamp <= lastTimestamp) {
            timestamp = BigInt(Date.now());
        }
        return timestamp;
    }

    function generateId(workerId: bigint, datacenterId: bigint): bigint {
        if (workerId > maxWorkerId || workerId < 0n) {
            throw new Error(`workerId must be between 0 and ${maxWorkerId}`);
        }
        if (datacenterId > maxDatacenterId || datacenterId < 0n) {
            throw new Error(`datacenterId must be between 0 and ${maxDatacenterId}`);
        }

        let timestamp = BigInt(Date.now());

        if (timestamp < lastTimestamp) {
            throw new Error(`Clock moved backwards. Refusing to generate id for ${lastTimestamp - timestamp} milliseconds`);
        }

        if (lastTimestamp === timestamp) {
            sequence = (sequence + 1n) & sequenceMask;
            if (sequence === 0n) {
                timestamp = tilNextMillis(lastTimestamp);
            }
        } else {
            sequence = 0n;
        }

        lastTimestamp = timestamp;

        return ((timestamp - epoch) << timestampLeftShift) |
            (datacenterId << datacenterIdShift) |
            (workerId << workerIdShift) |
            sequence;
    }

    const id = generateId(BigInt(workerId), BigInt(datacenterId));
    return id.toString().padStart(19, '1'); // Ensure the ID is 19 characters long and does not start with 0
}

/**
 * 格式化括号
 * @param src 输入字串
 * @param tag 格式化标记
 * @returns 返回括号内容增加 html 标记包裹
 * @example 
 * const src = "content (stop fire)";
 * const result = formatBracket(src,"message");
 * // result: content (<message>stop fire</message>)
 */
export function formatBracket(src: string, tag: string): string {
    // 使用栈来处理嵌套括号，严格匹配相同类型的括号
    const stack: { index: number; openChar: string; closeChar: string }[] = [];
    const pairs: { start: number; end: number; openChar: string; closeChar: string; offset: number }[] = [];

    // 定义括号类型映射
    const bracketPairs: { [key: string]: string } = {
        '[': ']',
        '(': ')',
        '（': '）'
    };

    let inHtmlTag = false;
    let inHtmlAttribute = false;

    // 首先找出所有匹配的括号对，跳过HTML标签属性中的内容
    for (let i = 0; i < src.length; i++) {
        const char = src[i];

        // 检测HTML标签开始和属性
        if (char === '<' && !inHtmlTag) {
            inHtmlTag = true;
            continue;
        }

        if (char === '>' && inHtmlTag) {
            inHtmlTag = false;
            inHtmlAttribute = false;
            continue;
        }

        if (inHtmlTag && char === ' ' && !inHtmlAttribute) {
            inHtmlAttribute = true;
            continue;
        }

        // 如果在HTML标签属性中，跳过括号处理
        if (inHtmlTag && inHtmlAttribute) {
            continue;
        }

        // 检查是否是开括号
        if (bracketPairs[char]) {
            stack.push({
                index: i,
                openChar: char,
                closeChar: bracketPairs[char]
            });
            continue;
        }

        // 检查是否是闭括号
        if (stack.length > 0 && Object.values(bracketPairs).includes(char)) {
            let jCount = 0;
            for (let j = stack.length - 1; j >= 0; j--) {
                const last = stack[j];
                jCount++;
                if (char === last.closeChar) {
                    for (let k = 1; k < jCount - 1; k++) {
                        // 不匹配的闭括号将被忽略
                        stack.pop();
                    }
                    const popLast = stack.pop()!;
                    pairs.push({
                        start: last.index,
                        end: i,
                        openChar: last.openChar,
                        closeChar: last.closeChar,
                        offset: 0,
                    });
                    break;
                }
            }
        }
    }

    // 按从内到外的顺序处理括号对（避免嵌套问题）
    pairs.sort((a, b) => b.start - a.start);

    // 第二阶段：应用替换，跟踪偏移量
    let result = src;
    let offset = 0; // 跟踪由于插入标签导致的偏移
    // 上一个位置
    const lastPostion = { start: 0, end: src.length };

    for (const pair of pairs) {
        const originalStart = pair.start;
        const originalEnd = pair.end;

        // 检查上一个处理位置与当前位置关系
        let adjustedStart = originalStart;
        let adjustedEnd = originalEnd;
        for (const pair_offset of pairs) {
            if (pair.start === pair_offset.start) {
                break;
            }
            if (adjustedStart > pair_offset.start) {
                adjustedStart += pair_offset.offset;
            }
            if (adjustedEnd > pair_offset.end) {
                adjustedEnd += pair_offset.offset;
            }
        }
        lastPostion.start = originalStart;
        lastPostion.end = originalEnd;

        const content = result.slice(adjustedStart + 1, adjustedEnd);

        // 计算新内容的长度
        const newContent = `${pair.openChar}<${tag}>${content}</${tag}>${pair.closeChar}`;
        const newLength = newContent.length;
        const oldLength = originalEnd - originalStart + 1;

        // 执行替换
        result =
            result.slice(0, adjustedStart) +
            newContent +
            result.slice(adjustedEnd + 1);

        // 更新偏移量
        offset += (newLength - oldLength);
        pair.offset = newLength - oldLength;
    }

    return result;
}

/**
 * 对字符串进行掩码处理
 * @param src 原始字符串
 * @param mask 掩码模板字符串，由'#'和'*'组成，'#'表示保留原字符，'*'表示需要掩码的位置
 * @param fillMask 当模板长度不足时，用于填充模板的字符（只能是'#'或'*'），默认为'*'
 * @param maskMark 实际输出时用于替换模板中'*'的字符，默认为'*'（可以是任意字符）
 * @param align 长度不一致时的对齐方式（'left'或'right'），默认为'left'
 * @returns 处理后的掩码字符串
 * 
 * @example
 * // 基本用法：保留前2后2，中间用*掩码
 * mask("1234567890", "##******##"); // "12******90"
 * 
 * @example
 * // 使用X作为掩码输出字符
 * mask("1234567890", "##******##", "*", "X"); // "12XXXXXX90"
 * 
 * @example
 * // 右对齐，模板不足时用#填充（即保留原字符）
 * mask("123456", "###", "#", "*", "right"); // "123456"
 * 
 * @example
 * // 左对齐，模板不足时用*填充（即需要掩码）
 * mask("123456", "###", "*", "X", "left"); // "123XXX"
 */
export function mask(src: string, mask: string, align: "left" | "right" = "left", fillMask: "#" | "*" = "*", maskMark: string = "*"): string {
    // # 原样显示，* 使用 maskMark 替换
    const result: string[] = [];
    const srcArr = src.split('');
    const maskArr = mask.split('');
    const maxLen = Math.max(src.length, mask.length);

    for (let i = 0; i < maxLen; i++) {
        const srcIdx = align === "left" ? i : src.length - 1 - i;
        const maskIdx = align === "left" ? i : mask.length - 1 - i;

        const srcChar = srcIdx >= 0 && srcIdx < src.length ? srcArr[srcIdx] : null;
        let maskChar = maskIdx >= 0 && maskIdx < mask.length ? maskArr[maskIdx] : fillMask;

        if (srcChar === null) break;

        if (maskChar === '#') {
            result.push(srcChar); // 保留原字符
        } else if (maskChar === '*') {
            result.push(maskMark); // 使用指定字符掩码
        } else {
            // 理论上不会执行，因为mask只能是#或*
            if (fillMask === "#") {
                result.push(srcChar);
            }
            else {
                result.push(maskMark);
            }
        }
    }

    return align === "right" ? result.reverse().join('') : result.join('');
}


/**
 * 将字符串转换为布尔值
 * 
 * @param value - 要转换的字符串，可以是 boolean、string、null 或 undefined
 * @param trueKeys - 可选参数，自定义被视为 true 的字符串值列表
 * @returns 转换后的布尔值
 * 
 * @example
 * // 使用默认 true 值列表
 * boolValue('true');  // 返回 true
 * boolValue('YES');   // 返回 true
 * boolValue('false'); // 返回 false
 * 
 * @example
 * // 使用自定义 true 值列表
 * boolValue('enabled', ['enabled', 'active']); // 返回 true
 * boolValue('active', ['enabled', 'active']);  // 返回 true
 */
export function boolValue(value: any | null | undefined, trueKeys?: string[]): boolean {
    // 处理空值情况
    if (!value) return false;

    if (typeof value === 'boolean') return value;

    let str = "";
    if (typeof value !== 'string') {
        str = value;
    }
    else {
        str = value.toString();
    }

    // 统一转换为小写并去除首尾空格
    const normalizedStr = str.toLowerCase().trim();

    // 如果传入了自定义 trueKeys，则使用自定义列表
    if (trueKeys && trueKeys.length > 0) {
        return trueKeys.some(key => key.toLowerCase() === normalizedStr);
    }

    // 默认情况下检查这些值视为 true
    return ['true', '1', 'yes', 'y', 'on'].includes(normalizedStr);
}