const isFn = fn => typeof fn === 'function';

const isJSON = cType => /application\/json/i.test(cType);

const isForm = cType => /application\/x-www-form-urlencoded/i.test(cType);

const isStr = v => v && typeof v === 'string';

const isObj = o => Object.prototype.toString.call(o) === '[object Object]';

const xhrPool = [],
	ArrayBufferView = Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array())).constructor,
	MIME = {
		json: 'application/json',
		form: 'application/x-www-form-urlencoded',
		html: 'text/html',
		xml: 'application/xml',
		text: 'text/plain'
	},
	events = [
		'onloadstart',
		'onprogress',
		'onabort',
		'onerror',
		'onload',
		'ontimeout',
		'onloadend',
		'onreadystatechange'
	];

let jsonpId = Date.now(),
	cacheRand = Date.now() + 5,
	xhrId = 0,
	globalSerialize = null,
	globalDeserialize = null;

function createXhr() {
	const xhr = new XMLHttpRequest();
	Object.defineProperty(xhr, '_active', {
		value: false,
		writable: true,
		enumerable: false
	});
	Object.defineProperty(xhr, '_id', {
		value: ++xhrId,
		writable: true,
		enumerable: false
	});
	return xhr;
}

function resetXhr(xhr) {
	// responseType, withCredentials以及header相关的会在open后重置
	xhr._active = false;
	// 可能是同步请求那就不能设置timeout
	try {
		xhr.timeout = 0;
		/* eslint-disable-next-line */
	} catch (e) {}
	events.forEach(v => (xhr[v] = null));
	xhr.upload && events.forEach(v => (xhr.upload[v] = null));
}

function xhrFactory() {
	for (let i = 0, len = xhrPool.length; i < len; ++i) {
		if (!xhrPool[i]._active) {
			return xhrPool[i];
		}
	}
	return createXhr();
}

function querystring(obj) {
	if (isObj(obj)) {
		return Object.keys(obj)
			.map(
				k =>
					Array.isArray(obj[k])
						? obj[k]
							.map(v => `${encodeURIComponent(k)}=${encodeURIComponent(JSON.stringify(v))}`)
							.join('&')
						: `${encodeURIComponent(k)}=${encodeURIComponent(JSON.stringify(obj[k]))}`
			)
			.join('&');
	} else {
		return JSON.stringify(obj);
	}
}

function defaultSerialize({data, method, contentType = MIME.json, url, cache}) {
	if (!cache) {
		url += ~url.indexOf('?') ? `&_=${++cacheRand}` : `?_=${++cacheRand}`;
	}
	if (method === 'GET' || method === 'HEAD') {
		return {
			url,
			data
		};
	}
	if (
		data instanceof Document ||
		// URLSearchParams和ReadableStream暂时不考虑支持了, 浏览器版本要求比较高
		// data instanceof URLSearchParams ||
		// data instanceof ReadableStream ||
		data instanceof Blob ||
		data instanceof FormData ||
		data instanceof ArrayBuffer ||
		data instanceof ArrayBufferView ||
		typeof data === 'string'
	) {
		return {
			url,
			data
		};
	}
	if (isJSON(contentType)) {
		data = JSON.stringify(data);
	} else if (isForm(contentType)) {
		data = querystring(data);
	} else {
		throw new TypeError(
			'Unknown data type, you can provide a custom serialize function in options to override the default.'
		);
	}
	return {
		url,
		data
	};
}

function defaultDeserialize({data, contentType, acceptType}) {
	let rst = null;
	if (isStr(data) && (isJSON(contentType) || isJSON(acceptType))) {
		try {
			rst = JSON.parse(data);
		} catch (e) {
			console.error('Invalid json string');
			rst = data;
		}
	}
	return rst;
}

function setHeaders(xhr, headers) {
	if (isObj(headers)) {
		Object.keys(headers).forEach(k => xhr.setRequestHeader(k, headers[k]));
	}
}

function isolateTryCatch({xhr, reqData, acceptType, dslz, success, error, complete}) {
	// 这一坨有点恶心...考虑下怎么优化
	// 这里是为了捕获callback的异常, 以便最终可以reset
	try {
		let hasErrorCb = isFn(error),
			hasCompleteCb = isFn(complete),
			hasSuccessCb = isFn(success),
			errOccured = false,
			resData = null;
		// 覆盖用户自定义
		xhr.onreadystatechange = function (e) {
			if (this.readyState === 4) {
				if (
					!((this.status >= 200 && this.status < 300) || this.status == 304) &&
					this.status !== 0
				) {
					// 404之类的错误会在这里捕获, try-catch不能捕获
					errOccured = true;
					if (!hasErrorCb && !hasCompleteCb) {
						throw new Error(
							`Remote server error. Status code: ${this.status}, message: ${this.statusText}.`
						);
					}
					// 异常不管直接抛
					hasErrorCb && error(new Error(`Remote server error. Status code: ${this.status}, message: ${this.statusText}.`), xhr, e);
					hasCompleteCb && complete(xhr, 'error');
				}
			}
		};
		// 同步不触发onerror, 这里是为了捕获网络异常h和跨域异常
		try {
			xhr.send(reqData || null);
		} catch (e) {
			errOccured = true;
			// 没有监听异常事件也不要吞掉异常, 跨域错误会在这里被捕获
			if (!hasErrorCb && !hasCompleteCb) {
				throw e;
			}
			// 异常不管直接抛
			hasErrorCb && error(e, xhr, null);
			hasCompleteCb && complete(xhr, 'error');
		}
		if (!errOccured) {
			const resCtype = xhr.getResponseHeader('Content-Type');
			resData = dslz({
				data: xhr.responseXML || xhr.response || xhr.responseText,
				contentType: resCtype,
				acceptType
			});
			// 异常直接抛, success不能在try中, 可能是success导致的异常进而使得控制流走向error
			hasSuccessCb && success(resData, xhr, null);
			hasCompleteCb && complete(xhr, 'success');
		}
		// loadend会在请求完成之后同步代码之前触发, 导致没办法依赖loadend来reset, 必须等到所有callback使用完xhr之后
		// xhr才算idle, 但是如果callback中异步引用了xhr也依然会有问题, 因为目的是希望所有callback执行完之后
		// 就不再使用xhr了, 避免xhr在下个请求中产生竞争, 除非不向callback暴露xhr, 但这也不现实
		resetXhr(xhr);
		return resData;
	} catch (err) {
		resetXhr(xhr);
		throw err;
	}
}

function setEvents(target, evts) {
	if (isObj(evts) && target) {
		// 不用addEventListener是它不方便reset
		Object.keys(evts)
			.filter(k => events.includes(k))
			.forEach(k => (target[k] = events[k]));
	}
}

function jsonp(options) {
	let {
		url,
		cache = false,
		crossorigin,
		callbackName,
		success,
		beforeSend,
		complete,
		error
	} = options;

	const hasOriginalCb = isFn(window[callbackName]);
	if (isStr(callbackName) && !hasOriginalCb) {
		throw new Error(`${callbackName} is not a function.`);
	}

	const hasSuccessCb = isFn(success),
		hasErrorCb = isFn(error),
		hasCompleteCb = isFn(complete),
		originalCb = hasOriginalCb ? window[callbackName] : undefined;

	if (!hasSuccessCb && !hasCompleteCb & !hasOriginalCb) {
		throw new Error('Must set a success callback or complete callback.');
	}
	if (!isStr(url)) {
		throw new TypeError(`url expected a non empty string, but received ${JSON.stringify(url)}.`);
	}

	const hasCustomCbName = isStr(callbackName),
		cbName = hasCustomCbName ? callbackName : `jsonp${++jsonpId}`,
		script = document.createElement('script');

	if (url.split('?').length < 3) {
		// 没有占位符的话默认callback
		const qs = `callback=${encodeURIComponent(cbName)}`;
		url = ~url.indexOf('?') ? `${url}&${qs}` : `${url}?${qs}`;
	} else {
		url = url.replace(/\?(.+)=\?/, `?$1=${encodeURIComponent(cbName)}`);
	}
	!cache && (url += `&_=${++cacheRand}`);

	if (!window[cbName] || !window[cbName].hasHook) {
		window[cbName] = function (...args) {
			// 放前面, 防止后面的callback抛异常导致删不掉
			if (!hasCustomCbName) {
				delete window[cbName];
			}
			try {
				if (hasOriginalCb) {
					originalCb(...args);
				} else if (hasSuccessCb) {
					success(...args);
				}
				// hasSuccessCb && success(...args);
				hasCompleteCb && complete('success');
				hasOriginalCb && (window[callbackName] = originalCb);
			} catch (e) {
				// 个人觉得应该crash掉让用户修复异常而不是继续执行complete
				// 所以这里只是为了还原window上原有的函数而不是为了吞掉异常
				hasOriginalCb && (window[callbackName] = originalCb);
				throw e;
			}
		};
		window[cbName].hasHook = true;
	}

	script.onerror = function (e) {
		document.body.removeChild(script);
		if (!hasCustomCbName) {
			delete window[cbName];
		}
		// 都没有的话就继续抛出异常, 方便异常监控系统捕获
		if (!hasErrorCb && !hasCompleteCb) {
			throw new Error(`Load script ${url} failed.`);
		}
		hasErrorCb && error(new Error(`Load script ${url} failed.`), e);
		hasCompleteCb && complete('error');
	};

	script.onload = () => setTimeout(() => document.body.removeChild(script), 3000);

	crossorigin && (script.crossOrigin = crossorigin);
	script.src = url;

	if (isFn(beforeSend)) {
		setTimeout(() => {
			// 允许拦截掉不发送请求
			const rst = beforeSend(url, options);
			rst !== false && document.body.appendChild(script);
		});
	} else {
		document.body.appendChild(script);
	}
}

function ajax(options) {
	let {
		url = location.href,
		method = 'GET',
		contentType: reqCtype,
		beforeSend,
		complete,
		data: reqRawData,
		dataType: acceptType = 'json',
		error,
		headers,
		mimeType,
		responseType = '',
		username,
		password,
		success,
		timeout = 0,
		ontimeout,
		events,
		uploadEvents,
		withCredentials = false,
		cache = true,
		serialize,
		deserialize
	} = options;

	method = method.toUpperCase().trim();
	// IE是什么...
	// xhr不支持CONNECT, TRACE, TRACK方法
	if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(method)) {
		throw new Error(`Invalid HTTP method: ${method}`);
	}
	// 允许所有callback都没有

	// 准备数据
	if (isStr(reqCtype)) {
		MIME[reqCtype] && (reqCtype = MIME[reqCtype]);
	} else if (reqCtype) {
		throw new TypeError(
			'contentType could be "json", "form", "html", "xml", "text" or other custom string.'
		);
	}

	const slz = isFn(serialize)
			? serialize
			: isFn(globalSerialize)
				? globalSerialize
				: defaultSerialize,
		dslz = isFn(deserialize)
			? deserialize
			: isFn(globalDeserialize)
				? globalDeserialize
				: defaultDeserialize,
		protocol = /^([\w-]+:)\/\//.exec(url)[1],
		xhr = xhrFactory(),
		hasCompleteCb = isFn(complete),
		hasErrorCb = isFn(error),
		hasSuccessCb = isFn(success);

	let reqData,
		errCalled = false,
		completeCalled = false;
	({url, data: reqData} = slz({data: reqRawData, method, contentType: reqCtype, url, cache}));

	// 初始化xhr
	xhr._active = true;
	xhr.open(method, url, true, username, password);

	// 设置必要的头部
	if (reqCtype) {
		xhr.setRequestHeader('Content-Type', reqCtype);
	} else if (isStr(reqData)) {
		// 不在默认参数设json是为了让FormData之类的能够由浏览器自己设置
		// 这里只对字符串的body设置默认为json
		xhr.setRequestHeader('Content-Type', MIME.json);
	}
	if (isStr(acceptType)) {
		MIME[acceptType] && (acceptType = MIME[acceptType]);
		xhr.setRequestHeader('Accept', acceptType);
	}
	setHeaders(xhr, headers);

	isStr(mimeType) && xhr.overrideMimeType(mimeType);

	// 主要是给progress等事件用, 但存在破坏封装的风险
	setEvents(xhr, events);
	setEvents(xhr.upload, uploadEvents);

	withCredentials && (xhr.withCredentials = withCredentials);
	responseType && (xhr.responseType = responseType);
	timeout && (xhr.timeout = timeout);
	if (isFn(ontimeout)) {
		xhr.ontimeout = ontimeout.bind(null);
	} else if (timeout && !isFn(xhr.ontimeout)) {
		xhr.ontimeout = function () {
			// 如果没监听ontimeout但是设置了timeout, window.onerror不会捕获这个错误, 所以手动抛个
			throw new Error(`Request ${url} timeout.`);
		};
	}

	// loadend无论同步还是异步请求, 无论前面的事件是否抛异常, 它都会执行
	if (isFn(xhr.onloadend)) {
		const originalLoadend = xhr.onloadend;
		xhr.onloadend = function (e) {
			resetXhr(this);
			originalLoadend.call(this, e);
		};
	} else {
		xhr.onloadend = function () {
			resetXhr(this);
		};
	}
	// 覆盖掉用户自定义onreadystatechange
	xhr.onreadystatechange = function (e) {
		if (this.readyState === 4) {
			if (
				(this.status >= 200 && this.status < 300) ||
				this.status == 304 ||
				(this.status == 0 && protocol == 'file:')
			) {
				const resCtype = this.getResponseHeader('Content-Type');
				const resData = dslz({
					data: this.responseXML || this.response || this.responseText,
					contentType: resCtype,
					acceptType
				});
				// 异常直接抛
				hasSuccessCb && success(resData, this, e);
				hasCompleteCb && complete(this, 'success');
			} else if (this.status !== 0) {
				// 这类错误xhr.onerror和window.onerror都不捕获所以手动抛一个
				if (!hasErrorCb && !hasCompleteCb) {
					throw new Error(
						`Remote server error. Status code: ${this.status}, message: ${this.statusText}.`
					);
				}
				// 理论上来讲好像没必要再注册xhr.onerror了, 因为如果有error那status必然为0
				// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/status
				// 但是不加个心里不踏实...总感觉会不会有浏览器没按规范实现
				// 不过知名的库页都没监听onerror, 那说明应该是都按规范实现了的
				// 但是我要加!!!
				if (hasErrorCb) {
					errCalled = true;
					error(new Error(`Remote server error. Status code ${this.status}`), this, e);
				}
				if (hasCompleteCb) {
					completeCalled = true;
					complete(this, 'error');
				}
			}
		}
	};

	// 覆盖
	xhr.onerror = function (e) {
		// 跨域错误会在这里捕获, 但是window.onerror不捕获, 所以也手动抛一个
		if (!hasErrorCb && !hasCompleteCb) {
			throw new Error(`An error occured, maybe crossorigin error. Status code: ${this.status}.`);
		}
		if (!errCalled && hasErrorCb) {
			error(new Error('Network error or browser restricted.'), this, e);
		}
		if (!completeCalled && hasCompleteCb) {
			complete(this, 'error');
		}
	};

	// 哎...都异步吧
	if (isFn(beforeSend)) {
		setTimeout(() => {
			const rst = beforeSend(xhr, options);
			rst !== false && xhr.send(reqData || null);
		});
	} else {
		xhr.send(reqData || null);
	}
	// 不暴露xhr
	return {
		abort() {
			xhr.abort();
		}
	};
}

function ajaxSync(options) {
	// 同步请求忽略timeout, responseType, withCredentials, 否则报错
	// 同步请求的callback都同步调用, 支持callback只是为了API保持一致
	let {
		url = location.href,
		method = 'GET',
		contentType: reqCtype,
		beforeSend,
		complete,
		data: reqRawData,
		dataType: acceptType = 'json',
		error,
		headers,
		mimeType,
		username,
		password,
		success,
		events,
		uploadEvents,
		cache = true,
		serialize,
		deserialize
	} = options;

	method = method.toUpperCase().trim();
	// IE是什么...
	// xhr不支持CONNECT, TRACE, TRACK方法
	if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(method)) {
		throw new Error(`Invalid HTTP method: ${method}`);
	}
	// 允许所有callback都没有

	// 准备数据
	if (isStr(reqCtype)) {
		MIME[reqCtype] && (reqCtype = MIME[reqCtype]);
	} else if (reqCtype) {
		throw new TypeError(
			'contentType could be "json", "form", "html", "xml", "text" or other custom string.'
		);
	}

	const slz = isFn(serialize)
			? serialize
			: isFn(globalSerialize)
				? globalSerialize
				: defaultSerialize,
		dslz = isFn(deserialize)
			? deserialize
			: isFn(globalDeserialize)
				? globalDeserialize
				: defaultDeserialize,
		xhr = xhrFactory();

	let reqData;
	({url, data: reqData} = slz({data: reqRawData, method, contentType: reqCtype, url, cache}));

	// 初始化xhr
	xhr._active = true;
	xhr.open(method, url, false, username, password);

	// 设置必要的头部
	if (reqCtype) {
		xhr.setRequestHeader('Content-Type', reqCtype);
	} else if (isStr(reqData)) {
		// 不在默认参数设json是为了让FormData之类的能够由浏览器自己设置
		// 这里只对字符串的body设置默认为json
		xhr.setRequestHeader('Content-Type', MIME.json);
	}
	if (isStr(acceptType)) {
		MIME[acceptType] && (acceptType = MIME[acceptType]);
		xhr.setRequestHeader('Accept', acceptType);
	}
	setHeaders(xhr, headers);

	isStr(mimeType) && xhr.overrideMimeType(mimeType);

	// 主要是给progress等事件用, 但存在破坏封装的风险
	setEvents(xhr, events);
	setEvents(xhr.upload, uploadEvents);

	if (isFn(beforeSend)) {
		const rst = beforeSend(xhr, options);
		return (
			rst !== false && isolateTryCatch({xhr, reqData, acceptType, dslz, success, error, complete})
		);
	} else {
		return isolateTryCatch({xhr, reqData, acceptType, dslz, success, error, complete});
	}
}

export function config({pool = false, serialize, deserialize} = {}) {
	if (pool) {
		xhrPool.length = 0;
		let poolSize = typeof pool === 'number' ? pool : 5;
		if (poolSize < 0) {
			throw new Error('pool size must >= 0');
		}
		while (poolSize--) {
			xhrPool.push(createXhr());
		}
	}
	isFn(serialize) && (globalSerialize = serialize);
	isFn(deserialize) && (globalDeserialize = deserialize);
}

export {ajax, ajaxSync, jsonp};

export function get(url, options) {
	return ajax({
		...options,
		url,
		method: 'GET'
	});
}

export function head(url, options) {
	return ajax({
		...options,
		url,
		method: 'HEAD'
	});
}

export function post(url, data, options) {
	return ajax({
		...options,
		url,
		data,
		method: 'POST'
	});
}

export function put(url, data, options) {
	return ajax({
		...options,
		url,
		data,
		method: 'PUT'
	});
}
export function del(url, data, options) {
	return ajax({
		...options,
		url,
		data,
		method: 'DELETE'
	});
}
export function patch(url, data, options) {
	return ajax({
		...options,
		url,
		data,
		method: 'PATCH'
	});
}
export function options(url, data, options) {
	return ajax({
		...options,
		url,
		data,
		method: 'OPTIONS'
	});
}
