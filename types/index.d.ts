export interface Abortable {
    abort: () => void;
}
export interface SerializeOptions {
    data: any;
    method: HTTPMethod;
    contentType?: string;
    url: string;
    cache: boolean;
}
export interface SerializeResult {
    url: string;
    data: any;
}
export interface DeserializeOptions {
    data: any;
    contentType: string | null | undefined;
    acceptType: string;
}
export interface ConfigOptions {
    pool?: number | boolean;
    serialize?: Serialize;
    deserialize?: Deserialize;
}
export interface NoBodyMethodOptions {
    contentType?: string;
    beforeSend?(xhr: CustomXMLHttpRequest, options: AjaxOptions): boolean | void;
    complete?(xhr: XMLHttpRequest, status: string): any;
    dataType?: string;
    recoverableError?(err: Error, resData: any, xhr: XMLHttpRequest, event: UIEvent | Event): any;
    unrecoverableError?(err: Error, xhr: XMLHttpRequest, event: UIEvent | Event): any;
    headers?: KVObject;
    mimeType?: keyof MIMEType;
    username?: string;
    password?: string;
    success?(resData: any, xhr: XMLHttpRequest, event: Event): any;
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
export interface BodyMethodOptions extends NoBodyMethodOptions {
    data?: any;
}
export interface AjaxOptions extends BodyMethodOptions {
    url?: string;
    method?: HTTPMethod;
}
interface CustomXMLHttpRequest extends XMLHttpRequest {
    _id: number;
    _active: boolean;
    requestURL?: string;
}
export interface MIMEType {
    json: string;
    form: string;
    html: string;
    xml: string;
    text: string;
}
interface KVObject {
    [k: string]: any;
}
export interface JsonpOptions {
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
export declare type HTTPMethod = 'GET' | 'POST' | 'HEAD' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'get' | 'post' | 'head' | 'put' | 'patch' | 'delete' | 'options';
export declare type Serialize = (options: SerializeOptions) => SerializeResult;
export declare type Deserialize = (options: DeserializeOptions) => any;
export declare type XhrEventsObj = {
    [k in XhrEvents]: Callable;
};
declare function jsonp(opts: JsonpOptions): void;
declare function ajax(opts: AjaxOptions): Abortable;
export declare function config({ pool, serialize, deserialize }?: ConfigOptions): void;
export { ajax, jsonp };
export declare function get(url: string, opts: NoBodyMethodOptions): Abortable;
export declare function head(url: string, opts: NoBodyMethodOptions): Abortable;
export declare function post(url: string, data: any, opts: BodyMethodOptions): Abortable;
export declare function put(url: string, data: any, opts: BodyMethodOptions): Abortable;
export declare function del(url: string, data: any, opts: BodyMethodOptions): Abortable;
export declare function patch(url: string, data: any, opts: BodyMethodOptions): Abortable;
export declare function options(url: string, data: any, opts: BodyMethodOptions): Abortable;
//# sourceMappingURL=index.d.ts.map