/*
 * @Author: Lin Ya
 * @Date: 2024-03-26 15:49:54
 * @LastEditors: Lin Ya
 * @LastEditTime: 2024-07-17 17:17:29
 * @Description: 数据导出方法
 */

export interface DataExportOption {
    //** 请求命令 */
    command: HttpCommand,
    /** 页码 */
    pageIndex: string,
    /** 记录总数 */
    pageTotal?: string,
    /** 分页总数 */
    pageCount?: string,
    /** 结果列表对象 */
    listItem: string,
    /** 每页记录数 */
    pageSize?: string,
    /** 页面范围(为空是全部页面；1,2,3 或者 2-5) */
    pageRange?: string,
}

export interface HttpCommand {
    url: string;
    method: string;
    headers: { [key: string]: string };
    body?: any;
}

export interface ParamMap {
    type: string;
    path: string;
    name?: string;
}



/**
 * 数据导出
 * @param options 请求参数
 * @param onProgress 执行进度回调
 * @returns 
 */
export async function dataExport(options: DataExportOption, onProgress?: (total: number, v: number) => void) {
    onProgress && onProgress(0, 0);
    const result: any[] = [];

    let pageRanges = parseRange(options.pageRange);

    let firstPage = pageRanges.length > 0 ? pageRanges[0] : 1;

    // 生成第一页请求参数
    let response = await executeCurl(options.command, options.pageIndex, firstPage);
    // 获取第一页数据
    let list = getProperty(response, options.listItem);
    if (!list) {
        return [];
    }

    // 加入结果列表
    result.push(...list);
    // 检查是否全部数据（页数范围）
    let total = +getProperty(response, options.pageTotal);
    onProgress && onProgress(total, result.length);
    if (!total || total === result.length) {
        onProgress && onProgress(total, total);
        return result;
    }
    let size = +getProperty(response, options.pageSize);
    if (isNaN(size)) size = result.length;
    size = size ?? result.length;

    let pageCount = +getProperty(response, options.pageCount);
    // 分页请求
    if (!pageCount || isNaN(pageCount)) pageCount = (total / size) + 1;
    if (pageRanges.length === 0) {
        // 填充数据
        for (let i = 1; i < pageCount; i++) {
            pageRanges.push(i);
        }
    }
    onProgress && onProgress(pageRanges.length, 1);
    for (let i = 1; i < pageRanges.length; i++) {
        response = await executeCurl(options.command, options.pageIndex, pageRanges[i]);
        let list = getProperty(response, options.listItem);
        if (!list) {
            return result;
        }
        // 加入结果列表
        result.push(...list);
        onProgress && onProgress(pageRanges.length, i + 1);
    }
    onProgress && onProgress(pageRanges.length, pageRanges.length);
    // 完成数据返回
    return result

}

/**
 * 分析页面范围
 * @param requestRange 页面范围：1,2 或者 2-4 ，默认为全部
 * @returns 页码数组
 */
function parseRange(requestRange?: string) {
    let result: number[] = [];
    if (!requestRange) return result;
    const input = requestRange.trim(); // 去除输入字符串两端的空格
    if (!input) {
        return result;
    }

    const ranges = input.split(','); // 使用逗号分割输入字符串

    result = [];

    for (const range of ranges) {
        if (range.includes('-')) {
            // 如果范围包含短横线，则是一个区间
            const [start, end] = range.split('-').map(Number); // 使用短横线分割区间，并将字符串转换为数字
            for (let i = start; i <= end; i++) {
                result.push(i); // 将区间内的每个页面添加到结果数组中
            }
        } else {
            // 否则，单个页面
            result.push(Number(range)); // 将单个页面添加到结果数组中
        }
    }
    return result;
}

export function getProperty(obj: any, PropertyPath?: string) {
    if (!PropertyPath || PropertyPath === null || PropertyPath === "") {
        return undefined;
    }
    // 解析属性路径
    const propertyPath = PropertyPath.split('.');
    let targetObj = obj;
    if (!targetObj) {
        console.warn(`Path:[${PropertyPath}] object does not exist.`, targetObj);
        return;
    }
    let at_index = -1;
    for (const property of propertyPath) {
        at_index++;
        if (targetObj[property] === undefined) {
            // 如果属性值是一个数组，则递归地处理数组中的每个元素
            if (Array.isArray(targetObj)) {
                const part_path = propertyPath.slice(at_index).join('.');
                const resultArray: any = targetObj.map((item: any) => getProperty(item, part_path));
                // 返回结果数组，如果结果数组为空则返回 undefined
                // console.log("+++", PropertyPath, part_path, property, targetObj, resultArray);

                return resultArray.length > 0 ? resultArray : undefined;
            }

            console.warn(`Path:[${PropertyPath}] Property ${property} does not exist in the body.`, targetObj, obj);
            return;
        }

        targetObj = targetObj[property];
    }
    return targetObj
}

export function setProperty(obj: any, propertyPath: string, value: any): any {
    if (!propertyPath || propertyPath === null || propertyPath === "") {
        return undefined;
    }

    // 解析属性路径
    const properties = propertyPath.split('.');
    let currentObj = obj;

    // 遍历属性路径
    for (let i = 0; i < properties.length - 1; i++) {
        const property = properties[i];
        if (!currentObj[property]) {
            currentObj[property] = {};
        }
        currentObj = currentObj[property];
    }

    // 设置最终属性的值
    currentObj[properties[properties.length - 1]] = value;
}

export function getQueryParams(url: string) {
    const params = new URLSearchParams(url.split('?')[1]);

    const parsedParams: any = {};
    for (const [key, value] of params) {
        parsedParams[key] = decodeURIComponent(value);
    }

    return parsedParams;
}

export function setQueryParam(url: string, paramName: string, newValue: string) {
    const params = new URLSearchParams(url.split('?')[1]);

    // 替换指定属性值
    params.set(paramName, newValue);

    // 重新构建 URL
    const baseUrl = url.split('?')[0];
    const newParamsString = params.toString();
    const newUrl = newParamsString ? `${baseUrl}?${newParamsString}` : baseUrl;

    return newUrl;
}

/**
 * 解析Curl命令
 * @param curlCommand Curl命令
 * @returns 
 */
export function parseCurl(curlCommand: string): HttpCommand {
    const parsedCommand: HttpCommand = {
        url: '',
        method: '',
        headers: {}
    };

    // 匹配 URL
    const urlRegex = /curl\s'([^']+)'/;
    const urlMatch = curlCommand.match(urlRegex);
    if (urlMatch && urlMatch[1]) {
        parsedCommand.url = urlMatch[1];
    }

    // 匹配方法
    const methodRegex = /(?:-X|--request)\s*([A-Z]+)\s/;
    const methodMatch = curlCommand.match(methodRegex);
    if (methodMatch && methodMatch[1]) {
        parsedCommand.method = methodMatch[1];
    } else {
        parsedCommand.method = 'GET'; // 默认为 GET 方法
    }

    // 匹配请求头部
    const headerRegex = /-H\s*'([^']+): ([^']+)'/g;
    let headerMatch;
    while ((headerMatch = headerRegex.exec(curlCommand)) !== null) {
        const [, key, value] = headerMatch;
        parsedCommand.headers[key] = value;
    }

    // 匹配请求体数据
    const bodyRegex = /--data-raw\s*'([^']+)'/;
    const bodyMatch = curlCommand.match(bodyRegex);
    if (bodyMatch && bodyMatch[1]) {
        try {
            parsedCommand.body = JSON.parse(bodyMatch[1]);
        } catch (error) {
            console.warn('Error parsing request body:', error);
        }
    }
    if (parsedCommand.body && parsedCommand.method.toUpperCase() === "GET") {
        parsedCommand.method = "POST";
    }

    return parsedCommand;
}

/**
 * 通过Curl命令获取数据
 * @param command Curl命令
 * @param pagePropertyPath 页码属性("page.index")
 * @param index 页码
 * @returns 数据
 */
export async function executeCurl(command: HttpCommand, pagePropertyPath?: string, index?: number) {
    const { url, method, headers, body } = command;
    // console.log("url", url, method, "headers", headers, 'body', body);
    let httpUrl = url;
    // 检查 pagePropertyPath ，如果根节点为：_urlParams，调用请求参数设置
    if (pagePropertyPath && index) {
        if (pagePropertyPath?.startsWith("_urlParams.")) {
            let path = pagePropertyPath.replace("_urlParams.", "");
            httpUrl = setQueryParam(url, path, <string><unknown>index);
        }
        else {
            setProperty(body, pagePropertyPath, index);
        }
    }

    try {
        const response = await fetch(httpUrl, {
            method: method,
            headers: headers,
            body: body ? JSON.stringify(body) : null
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        // console.log(responseData);
        return responseData;
    } catch (error) {
        console.error('There was an error!', error);
    }
}
