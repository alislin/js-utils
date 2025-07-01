/*
* @Author: Lin Ya
* @Date: 2022-06-08 10:53:42
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-07-01 08:47:30
* @Description: 数据请求
*/
export class Fetcher {

    /** 错误数据返回对象 */
    public ErrorResponse: (error: string) => {} = (err) => { return {} };
    public Hearders: HeadersInit = {};
    public BaseUrl: string = "";
    // public DefaultRequestInit: RequestInit = {};
    /** 加载状态 */
    public Loading: boolean = false;
    /** 错误提示 */
    public NotifyError: (msg: string) => void = (msg) => { console.log(msg); };


    /** 无授权API（403记录以后，后续跳过该API执行） */
    private NotAuthorizeApiList: string[] = [];
    public authorization(token: string): void {
        let head = this.Hearders as Record<string, string>;
        head["Authorization"] = token;
    }

    public bearer(token: string): void {
        this.authorization('Bearer ' + token);
    }

    public getRequest(method: string, data?: any) {
        if (method.toUpperCase() === "GET") {
            return {
                method: "GET",
                headers: this.Hearders,
            }
        }
        return {
            method: method.toUpperCase(),
            headers: this.Hearders,
            body: JSON.stringify(data),
        }
    }

    /**
     * 请求检查
     * @param request request
     * @returns request
     */
    public initRequest(request?: RequestInit) {
        if (request) {

            let headers = request.headers as Record<string, string>;
            if (request.method?.toUpperCase() !== "GET") {
                if (!headers["Content-Type"]) {
                    headers["Content-Type"] = "application/json";
                }
                if (!headers["Accept"]) {
                    headers["Accept"] = "application/json";
                }
                // if (!headers.has("Content-Type")) {
                //     headers.set("Content-Type", "application/json")
                // }
                // if (!headers.has("Accept")) {
                //     headers.set("Accept", "application/json")
                // }
            }
            return {
                method: request.method,
                headers: headers,
                body: request.body,
            };
        }
        return {};
    }

    public Get<T>(url: string, requestInit?: RequestInit) {
        if (!requestInit) {
            requestInit = {
                method: "GET",
                headers: this.Hearders,
            };
        }
        return this.Fetch<T>(url, requestInit);
    }

    public Post<T>(url: string, data: any, requestInit?: RequestInit) {
        if (!requestInit) {
            requestInit = {
                method: "POST",
                headers: this.Hearders,
                body: JSON.stringify(data),
            };
        }
        return this.Fetch<T>(url, requestInit);
    }

    public Put<T>(url: string, data: any, requestInit?: RequestInit) {
        if (!requestInit) {
            requestInit = {
                method: "PUT",
                headers: this.Hearders,
                body: JSON.stringify(data),
            };
        }
        return this.Fetch<T>(url, requestInit);
    }

    public Delete<T>(url: string, data: any, requestInit?: RequestInit) {
        if (!requestInit) {
            requestInit = {
                method: "DELETE",
                headers: this.Hearders,
                body: JSON.stringify(data),
            };
        }
        return this.Fetch<T>(url, requestInit);
    }

    public Patch<T>(url: string, data: any, requestInit?: RequestInit) {
        if (!requestInit) {
            requestInit = {
                method: "PATCH",
                headers: this.Hearders,
                body: JSON.stringify(data),
            };
        }
        return this.Fetch<T>(url, requestInit);
    }

    /**
     * 获取网络数据
     * @param url 地址
     * @param requestInit 请求参数
     * @returns 返回值
     */
    public Fetch<T>(url: string, requestInit?: RequestInit, baseUrl?: string): Promise<T> {
        this.Loading = true;
        const base = baseUrl ?? this.BaseUrl;

        let request = this.initRequest(requestInit);
        const req_url = url.toLowerCase().startsWith("http") ? url : base + url;
        if (this.IsDenyApi(req_url)) {
            this.Loading = false;
            console.warn(`无权限，禁用访问：${req_url}`);

            return new Promise(() => <T>this.ErrorResponse(`无权限:[${req_url}]`));
        }
        let resp = fetch(req_url, request)
            .then(response => {
                return this.handleResponse<T>(response);
            })
            .catch(error => {
                this.NotifyError("[" + request?.method + "]" + req_url + "]：" + error.message);
                return <T>this.ErrorResponse(error.message);
            });
        this.Loading = false;
        return resp;
    }
    public handleResponse<T>(response: Response): Promise<T> {
        let contentType = response.headers.get('content-type');
        if (response.ok) {
            if (contentType && contentType.indexOf('application/json') !== -1) {
                return response.json();
            }
        }
        if (response.status === 403 || response.status === 401) {
            const url = this.GetApiUrl(response.url);
            if (!this.NotAuthorizeApiList.includes(url)) {
                console.warn(`无授权的访问，后续将禁用：${url}`);

                this.NotAuthorizeApiList.push(url);
            }
        }
        throw new Error(response.status + " " + response.statusText);
    }

    public GetApiUrl(fullUrl: string) {
        var url = new URL(fullUrl);

        return url.origin + url.pathname;
    }

    public IsDenyApi(url: string) {
        return this.NotAuthorizeApiList.includes(url);
    }
}

