interface Abortable {
	abort(): void;
}

declare enum HTTPMethod {
	GET = 'GET',
	POST = 'POST',
	HEAD = 'HEAD',
	PUT = 'PUT',
	PATCH = 'PATCH',
	DELETE = 'DELETE',
	OPTIONS = 'OPTIONS',
}
interface SerializeOptions {
	data?: any;
	method?: HTTPMethod;
	contentType?: string;
	url?: string;
	cache?: boolean;
}
interface SerializeResult {
	url: string;
	data: any;
}
interface DeserializeOptions {
	data?: any;
	contentType?: string;
	acceptType?: string;
}
interface Serialize {
	(options: SerializeOptions): SerializeResult;
}
interface Deserialize {
	(options: DeserializeOptions): any;
}
interface RequestOptions {
	contentType?: string;
	beforeSend?(xhr: XMLHttpRequest, options: AsyncOptions): boolean | void;
	complete?(xhr: XMLHttpRequest, status: string): void;
	dataType?: string;
	error?(err: Error, xhr: XMLHttpRequest, event: UIEvent): void;
	headers?: object;
	mimeType?: string;
	username?: string;
	password?: string;
	success?(data: any, xhr: XMLHttpRequest, event: Event);
	events?: object;
	uploadEvents?: object;
	cache?: boolean;
	serialize?: Serialize;
	deserialize?: Deserialize;
}
interface BodyMethodOptions extends RequestOptions {
	responseType?: string;
	timeout?: number;
	ontimeout?(event: ProgressEvent): void;
	withCredentials?: boolean;
}
interface NoBodyMethodOptions extends BodyMethodOptions {
	data?: any;
}
interface AsyncOptions extends NoBodyMethodOptions {
	url?: string;
	method?: HTTPMethod;
}
interface JsonpOptions {
	url: string;
	cache?: boolean;
	crossorigin?: string;
	callbackName?: string;
	success?(args: any): void;
	beforeSend?(url: string, options: JsonpOptions): boolean | void;
	complete?(status: string): void;
	error?(err: Error, event: UIEvent): void;
}
interface ConfigOptions {
	pool?: number;
	serialize?: Serialize;
	deserialize?: Deserialize;
}

export function config(options: ConfigOptions): void;
export function ajax(options: AsyncOptions): Abortable;
export function jsonp(options: JsonpOptions): void;
export function get(url: string, options: NoBodyMethodOptions): Abortable;
export function head(url: string, options: NoBodyMethodOptions): Abortable;
export function post(url: string, data: any, options: BodyMethodOptions): Abortable;
export function put(url: string, data: any, options: BodyMethodOptions): Abortable;
export function patch(url: string, data: any, options: BodyMethodOptions): Abortable;
export function del(url: string, data: any, options: BodyMethodOptions): Abortable;
export function options(url: string, data: any, options: BodyMethodOptions): Abortable;
