interface SerializeOptions {
    data: any;
    method: HTTPMethod;
    contentType?: string;
    url: string;
    cache: boolean;
}
interface SerializeResult {
    url: string;
    data: any;
}
interface DeserializeOptions {
    data: any;
    contentType: string | null | undefined;
    acceptType: string;
}
interface ConfigOptions {
    pool?: number | boolean;
    serialize?: Serialize;
    deserialize?: Deserialize;
}
interface RequestOptions {
    contentType?: string;
    beforeSend?(xhr: CustomXMLHttpRequest, options: AsyncOptions): boolean | void;
    complete?(xhr: XMLHttpRequest, status: string): any;
    dataType?: string;
    error?(err: Error, data: any, xhr: XMLHttpRequest, event: UIEvent | Event): any;
    headers?: KVObject;
    mimeType?: keyof MIMEType;
    username?: string;
    password?: string;
    success?(data: any, xhr: XMLHttpRequest, event: Event): any;
    events?: XhrEventsObj;
    uploadEvents?: XhrEventsObj;
    cache?: boolean;
    serialize?: Serialize;
    deserialize?: Deserialize;
    responseType?: XMLHttpRequestResponseType;
    timeout?: number;
    ontimeout?(event: ProgressEvent): any;
    withCredentials?: boolean;
}
interface BodyMethodOptions extends RequestOptions {
    data?: any;
}
interface AsyncOptions extends BodyMethodOptions {
    url?: string;
    method?: HTTPMethod;
}
interface CustomXMLHttpRequest extends XMLHttpRequest {
    _id: number;
    _active: boolean;
    requestURL?: string;
}
interface MIMEType {
    json: string;
    form: string;
    html: string;
    xml: string;
    text: string;
}
interface KVObject {
    [k: string]: any;
}
interface JsonpOptions {
    url: string;
    cache?: boolean;
    crossorigin?: string;
    callbackName?: string;
    success?(data?: any): any;
    beforeSend?(url: string, options: JsonpOptions): boolean | void;
    complete?(status: string): any;
    error?(err: Error, event: string | UIEvent | Event): any;
}
declare type XhrEvents = 'onloadstart' | 'onprogress' | 'onabort' | 'onerror' | 'onload' | 'ontimeout' | 'onloadend' | 'onreadystatechange';
declare type Callable = (...args: Array<any>) => any;
declare type HTTPMethod = 'GET' | 'POST' | 'HEAD' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'get' | 'post' | 'head' | 'put' | 'patch' | 'delete' | 'options';
declare type Serialize = (options: SerializeOptions) => SerializeResult;
declare type Deserialize = (options: DeserializeOptions) => any;
declare type XhrEventsObj = {
    [k in XhrEvents]: Callable;
};
declare function jsonp(opts: JsonpOptions): void;
declare function ajax(opts: AsyncOptions): {
    abort(): void;
};
export declare function config({ pool, serialize, deserialize }?: ConfigOptions): void;
export { ajax, jsonp };
export declare function get(url: string, opts: RequestOptions): {
    abort(): void;
};
export declare function head(url: string, opts: RequestOptions): {
    abort(): void;
};
export declare function post(url: string, data: any, opts: BodyMethodOptions): {
    abort(): void;
};
export declare function put(url: string, data: any, opts: BodyMethodOptions): {
    abort(): void;
};
export declare function del(url: string, data: any, opts: BodyMethodOptions): {
    abort(): void;
};
export declare function patch(url: string, data: any, opts: BodyMethodOptions): {
    abort(): void;
};
export declare function options(url: string, data: any, opts: BodyMethodOptions): {
    abort(): void;
};
//# sourceMappingURL=index.d.ts.map