(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.tinyjx = {}));
}(this, function (exports) { 'use strict';

	const isFn = fn => typeof fn === 'function';

	const isJSON = cType => /application\/json/i.test(cType);

	const isForm = cType => /application\/x-www-form-urlencoded/i.test(cType);

	const isNoEmptyStr = v => v && typeof v === 'string';

	const isStrOrStrListRecord = o => Object.prototype.toString.call(o) === '[object Object]';

	const lc = window.location;
	const xhrPool = [],
	      // tslint:disable-next-line
	ArrayBufferView = Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array())).constructor,
	      // 为什么这里不用字符串枚举?
	// 因为枚举的反查带来不必要的开销, 而const枚举
	// 又会在编译时内联, 不能使用key索引查找值,
	// 另一方面又希望有一些类型检查, 所以折中这样
	MIME = {
	  json: 'application/json',
	  form: 'application/x-www-form-urlencoded',
	  html: 'text/html',
	  xml: 'application/xml',
	  text: 'text/plain'
	},
	      events = ['onloadstart', 'onprogress', 'onabort', 'onerror', 'onload', 'ontimeout', 'onloadend', 'onreadystatechange'];
	let jsonpId = Date.now(),
	    cacheRand = Date.now() + 5,
	    globalSerialize = null,
	    globalDeserialize = null;

	function createXhr() {
	  // 不用class继承, 省得编译出来多一个函数
	  const xhr = new XMLHttpRequest();
	  Object.defineProperty(xhr, '_active', {
	    value: false,
	    writable: true,
	    enumerable: false
	  });
	  Object.defineProperty(xhr, 'requestURL', {
	    value: '',
	    writable: true,
	    enumerable: false
	  });

	  return xhr;
	}

	function resetXhr(xhr) {
	  // responseType, withCredentials以及header相关的会在open后重置
	  xhr._active = false; // 可能是同步请求那就不能设置timeout

	  try {
	    xhr.timeout = 0;
	    xhr.requestURL = ''; // tslint:disable-next-line
	  } catch (e) {}

	  events.forEach(v => xhr[v] = null); // 这里不建议给XMLHttpRequestUpload patch一个索引类型, 可能影响到其他地方

	  xhr.upload && events.forEach(v => xhr.upload[v] = null);
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
	  if (isStrOrStrListRecord(obj)) {
	    return Object.keys(obj).map(k => {
	      const value = obj[k];
	      return Array.isArray(value) ? value.map(v => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&') : `${encodeURIComponent(k)}=${encodeURIComponent(value)}`;
	    }).join('&');
	  } else {
	    return JSON.stringify(obj);
	  }
	}

	const defaultSerialize = ({
	  data,
	  method,
	  processData,
	  contentType = MIME.json,
	  url,
	  cache
	}) => {
	  if (!cache) {
	    // 字符串不可变, 所以这里懒得起名了, 赋值url其实不影响外部
	    // tslint:disable-next-line
	    url += ~url.indexOf('?') ? `&_=${++cacheRand}` : `?_=${++cacheRand}`;
	  }

	  if (method === 'GET' || method === 'HEAD') {
	    if (processData) {
	      // tslint:disable-next-line
	      url += ~url.indexOf('?') ? `&${querystring(data)}` : `?${querystring(data)}`;
	    }

	    return {
	      url,
	      data
	    };
	  }

	  if (data instanceof Document || // URLSearchParams和ReadableStream暂时不考虑支持了, 浏览器版本要求比较高
	  // data instanceof URLSearchParams ||
	  // data instanceof ReadableStream ||
	  data instanceof Blob || data instanceof FormData || data instanceof ArrayBuffer || data instanceof ArrayBufferView || typeof data === 'string') {
	    return {
	      url,
	      data
	    };
	  }

	  let resultData = null;

	  if (isJSON(contentType)) {
	    resultData = JSON.stringify(data);
	  } else if (isForm(contentType)) {
	    resultData = querystring(data);
	  } else {
	    throw new TypeError('Unknown data type, you can provide a custom serialize function in options to override the default.');
	  }

	  return {
	    url,
	    data: resultData
	  };
	};

	const defaultDeserialize = ({
	  data,
	  contentType,
	  acceptType
	}) => {
	  let rst = null;

	  if (isNoEmptyStr(data) && (isNoEmptyStr(contentType) && isJSON(contentType) || isJSON(acceptType))) {
	    try {
	      rst = JSON.parse(data);
	    } catch (e) {
	      console.error('Invalid json string');
	      rst = data;
	    }
	  } else {
	    rst = data;
	  }

	  return rst;
	};

	function setHeaders(xhr, headers) {
	  Object.keys(headers).forEach(k => xhr.setRequestHeader(k, headers[k]));
	}

	function setEvents(target, evts) {
	  if (isStrOrStrListRecord(evts) && target) {
	    // 不用addEventListener是它不方便reset
	    Object.keys(evts).filter(k => events.indexOf(k) !== -1).forEach(k => target[k] = evts[k]);
	  }
	}

	function jsonp(opts) {
	  let {
	    url,

	    /* tslint:disable */
	    cache = false,
	    crossorigin,
	    callbackName,
	    success,
	    beforeSend,
	    complete,
	    error
	    /* tslint:enable */

	  } = opts;
	  const hasOriginalCb = callbackName && isFn(window[callbackName]);

	  if (isNoEmptyStr(callbackName) && !hasOriginalCb) {
	    throw new Error(`${callbackName} is not a function.`);
	  }

	  const hasSuccessCb = isFn(success),
	        hasErrorCb = isFn(error),
	        hasCompleteCb = isFn(complete),
	        // hasOriginalCb为true的话, callbackName肯定不为空, 前面已经判断过了, 这里把空值去除
	  originalCb = hasOriginalCb ? window[callbackName] : undefined;

	  if (!hasSuccessCb && !hasCompleteCb && !hasOriginalCb) {
	    throw new Error('Must set a success callback or complete callback.');
	  }

	  if (!isNoEmptyStr(url)) {
	    throw new TypeError(`url expected a non empty string, but received ${JSON.stringify(url)}.`);
	  }

	  const hasCustomCbName = isNoEmptyStr(callbackName),
	        // hasCustomCbName为true的话, callbackName肯定为非空字符串, 这里去掉空值
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
	  const w = window;

	  if (!w[cbName] || !w[cbName].hasHook) {
	    w[cbName] = function (...args) {
	      // 放前面, 防止后面的callback抛异常导致删不掉
	      if (!hasCustomCbName) {
	        delete w[cbName];
	      }

	      try {
	        if (hasOriginalCb) {
	          originalCb(...args);
	        } else if (hasSuccessCb) {
	          // 这里hasSuccessCb已经是类型保护isFn的结果了, 但是需要直接调用isFn
	          // 才能获得类型保护, 为了减少函数调用, 就暂存了类型保护的结果为hasSuccessCb
	          // 所以这里success也应当是不为空的, 去掉空值, 但是是用!去除还是用as
	          // 应该是都可以, 但是这里来讲应该是!好一点, 因为这里success用as那就是Callble,
	          // 用!那就是JsonpOptions中定义的类型, Callble更关心success是否可以作为函数调用,
	          // 而JsonpOptions中的定义更关心具体参数的类型和个数, 这里我们更关心参数类型,
	          // 所以用!去除空值
	          success(...args);
	        }

	        hasCompleteCb && complete('success'); // 同样, hasOriginalCb为true则callbackName不可能空, 去除空值

	        hasOriginalCb && (w[callbackName] = originalCb);
	      } catch (e) {
	        // 个人觉得应该crash掉让用户修复异常而不是继续执行complete
	        // 所以这里只是为了还原window上原有的函数而不是为了吞掉异常
	        hasOriginalCb && (w[callbackName] = originalCb);
	        throw e;
	      }
	    };

	    w[cbName].hasHook = true;
	  }

	  script.onerror = function (e) {
	    document.body.removeChild(script);

	    if (!hasCustomCbName) {
	      delete w[cbName];
	    } // 都没有的话就继续抛出异常, 方便异常监控系统捕获


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
	      const rst = beforeSend(url, opts);
	      rst !== false && document.body.appendChild(script);
	    });
	  } else {
	    document.body.appendChild(script);
	  }
	}

	function getResponse(xhr, key) {
	  // 在有responseType的情况下, 访问responseXML, responseText等都有可能抛出异常
	  try {
	    return xhr[key];
	  } catch (e) {
	    return null;
	  }
	}

	function ajax(opts) {
	  let {
	    url = lc.href,
	    method = 'GET',
	    contentType: reqCtype,
	    dataType: acceptType = 'json',

	    /* tslint:disable */
	    processData = true,
	    data: reqRawData,
	    beforeSend,
	    complete,
	    recoverableError,
	    unrecoverableError,
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
	    /* tslint:enable */

	  } = opts;
	  method = method.toUpperCase().trim(); // IE是什么...
	  // xhr不支持CONNECT, TRACE, TRACK方法

	  if (!(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].indexOf(method) !== -1)) {
	    throw new Error(`Invalid HTTP method: ${method}`);
	  } // 允许所有callback都没有
	  // 准备数据


	  if (isNoEmptyStr(reqCtype)) {
	    MIME[reqCtype] && (reqCtype = MIME[reqCtype]);
	  } else if (reqCtype) {
	    throw new TypeError('contentType could be "json", "form", "html", "xml", "text" or other custom string.');
	  }

	  const slz = isFn(serialize) ? serialize : isFn(globalSerialize) ? globalSerialize : defaultSerialize,
	        dslz = isFn(deserialize) ? deserialize : isFn(globalDeserialize) ? globalDeserialize : defaultDeserialize,
	        maybeProtocol = /^([\w-]+:)\/\//.exec(url),
	        hrefProtocol = /^(https?):\/\//.exec(lc.href),
	        protocol = maybeProtocol ? maybeProtocol[1] : hrefProtocol ? hrefProtocol[1] : null,
	        xhr = xhrFactory(),
	        hasCompleteCb = isFn(complete),
	        hasRecoverableErrorCb = isFn(recoverableError),
	        hasUnrecoverableErrorCb = isFn(unrecoverableError),
	        hasSuccessCb = isFn(success);
	  let reqData,
	      errCalled = false,
	      completeCalled = false; // 这里不用捕获异常去重置xhr是因为xhr还没激活

	  ({
	    url,
	    data: reqData
	  } = slz({
	    data: reqRawData,
	    method,
	    processData,
	    contentType: reqCtype,
	    url,
	    cache
	  })); // 初始化xhr

	  xhr._active = true;
	  xhr.open(method, url, true, username, password);
	  !xhr.requestURL && (xhr.requestURL = url); // 设置必要的头部

	  if (reqCtype) {
	    xhr.setRequestHeader('Content-Type', reqCtype);
	  } else if (isNoEmptyStr(reqData)) {
	    // 注意这里破坏了默认post是简单请求的行为
	    // 不在默认参数设json是为了让FormData之类的能够由浏览器自己设置
	    // 这里只对字符串的body设置默认为json
	    xhr.setRequestHeader('Content-Type', MIME.json);
	  }

	  if (isNoEmptyStr(acceptType)) {
	    MIME[acceptType] && (acceptType = MIME[acceptType]);
	    xhr.setRequestHeader('Accept', acceptType);
	  }

	  if (isStrOrStrListRecord(headers)) {
	    setHeaders(xhr, headers);
	  }

	  isNoEmptyStr(mimeType) && xhr.overrideMimeType(mimeType); // 主要是给progress等事件用, 但存在破坏封装的风险

	  setEvents(xhr, events);
	  setEvents(xhr.upload, uploadEvents);
	  withCredentials && (xhr.withCredentials = withCredentials);
	  responseType && (xhr.responseType = responseType);
	  timeout && (xhr.timeout = timeout);

	  if (isFn(ontimeout)) {
	    xhr.ontimeout = function (e) {
	      ontimeout(e);
	      hasCompleteCb && complete(this, 'timeout');
	    };
	  } else if (timeout && !isFn(xhr.ontimeout)) {
	    xhr.ontimeout = function () {
	      if (hasCompleteCb) {
	        complete(this, 'timeout');
	      } else {
	        // 如果没监听ontimeout但是设置了timeout, window.onerror不会捕获这个错误, 所以手动抛个
	        throw new Error(`Request ${this.requestURL} timeout.`);
	      }
	    };
	  } // loadend无论同步还是异步请求, 无论前面的事件是否抛异常, 它都会执行


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
	  } // 覆盖掉用户自定义onreadystatechange


	  xhr.onreadystatechange = function (e) {
	    if (this.readyState === 4) {
	      const resCtype = this.getResponseHeader('Content-Type'); // 这里也不用捕获异常, 因为xhr.onloadend会在之后帮我们回收xhr

	      const resData = dslz({
	        data: getResponse(xhr, 'responseXML') || getResponse(xhr, 'response') || getResponse(xhr, 'responseText'),
	        contentType: resCtype,
	        acceptType
	      });

	      if (this.status >= 200 && this.status < 300 || this.status === 304 || this.status === 0 && protocol === 'file:') {
	        // 异常直接抛
	        hasSuccessCb && success(resData, this, e);
	        hasCompleteCb && complete(this, 'success');
	      } else if (this.status !== 0) {
	        // 这类错误xhr.onerror和window.onerror都不捕获所以手动抛一个
	        if (!hasRecoverableErrorCb && !hasCompleteCb) {
	          throw new Error(`Remote server error. Request URL: ${this.requestURL}, Status code: ${this.status}, message: ${this.statusText}, response: ${this.responseText}.`);
	        } // 理论上来讲好像没必要再注册xhr.onerror了, 因为如果有error那status必然为0
	        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/status
	        // 但是不加个心里不踏实...总感觉会不会有浏览器没按规范实现
	        // 不过知名的库页都没监听onerror, 那说明应该是都按规范实现了的
	        // 但是我要加!!!


	        if (hasRecoverableErrorCb) {
	          errCalled = true;
	          recoverableError(new Error(`Remote server error. Request URL: ${this.requestURL}, Status code: ${this.status}, message: ${this.statusText}, response: ${this.responseText}.`), resData, this, e);
	        }

	        if (hasCompleteCb) {
	          completeCalled = true;
	          complete(this, 'error');
	        }
	      }
	    }
	  }; // 覆盖


	  xhr.onerror = function (e) {
	    // 跨域错误会在这里捕获, 但是window.onerror不捕获, 所以也手动抛一个
	    if (!hasUnrecoverableErrorCb && !hasCompleteCb) {
	      throw new Error(`An error occurred, maybe crossorigin error. Request URL: ${this.requestURL}, Status code: ${this.status}.`);
	    }

	    if (!errCalled && hasUnrecoverableErrorCb) {
	      unrecoverableError(new Error(`Network error or browser restricted. Request URL: ${this.requestURL}, Status code: ${this.status}`), this, e);
	    }

	    if (!completeCalled && hasCompleteCb) {
	      complete(this, 'error');
	    }
	  }; // 哎...都异步吧


	  if (isFn(beforeSend)) {
	    setTimeout(() => {
	      let rst;

	      try {
	        rst = beforeSend(xhr, opts);
	      } catch (e) {
	        // 恶心之处就在于每个用户定义的callback都可能触发异常, 然而我还要回收xhr
	        resetXhr(xhr);
	        throw e;
	      }

	      if (rst !== false) {
	        xhr.send(reqData || null);
	      } else {
	        resetXhr(xhr);
	      }
	    });
	  } else {
	    xhr.send(reqData || null);
	  } // 不暴露xhr


	  return {
	    abort() {
	      xhr.abort();
	    }

	  };
	}

	function config({
	  pool = false,
	  serialize,
	  deserialize
	} = {}) {
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
	function get(url, opts) {
	  return ajax(Object.assign({}, opts, {
	    url,
	    method: 'GET'
	  }));
	}
	function head(url, opts) {
	  return ajax(Object.assign({}, opts, {
	    url,
	    method: 'HEAD'
	  }));
	}
	function post(url, data, opts) {
	  return ajax(Object.assign({}, opts, {
	    url,
	    data,
	    method: 'POST'
	  }));
	}
	function put(url, data, opts) {
	  return ajax(Object.assign({}, opts, {
	    url,
	    data,
	    method: 'PUT'
	  }));
	}
	function del(url, data, opts) {
	  return ajax(Object.assign({}, opts, {
	    url,
	    data,
	    method: 'DELETE'
	  }));
	}
	function patch(url, data, opts) {
	  return ajax(Object.assign({}, opts, {
	    url,
	    data,
	    method: 'PATCH'
	  }));
	}
	function options(url, data, opts) {
	  return ajax(Object.assign({}, opts, {
	    url,
	    data,
	    method: 'OPTIONS'
	  }));
	}

	exports.config = config;
	exports.ajax = ajax;
	exports.jsonp = jsonp;
	exports.get = get;
	exports.head = head;
	exports.post = post;
	exports.put = put;
	exports.del = del;
	exports.patch = patch;
	exports.options = options;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=tinyjx.umd.js.map
