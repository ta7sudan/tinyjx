/**
 * @Version 0.2.5
 * @Author: ta7sudan
 * @Repo: https://github.com/ta7sudan/tinyjx#readme
 * @License: MIT
 */
function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

/* global false */
var isFn = function isFn(fn) {
  return typeof fn === 'function';
};

var isJSON = function isJSON(cType) {
  return /application\/json/i.test(cType);
};

var isForm = function isForm(cType) {
  return /application\/x-www-form-urlencoded/i.test(cType);
};

var isStr = function isStr(v) {
  return v && typeof v === 'string';
};

var isObj = function isObj(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
};

var xhrPool = [],
    ArrayBufferView = Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array())).constructor,
    MIME = {
  json: 'application/json',
  form: 'application/x-www-form-urlencoded',
  html: 'text/html',
  xml: 'application/xml',
  text: 'text/plain'
},
    events = ['onloadstart', 'onprogress', 'onabort', 'onerror', 'onload', 'ontimeout', 'onloadend', 'onreadystatechange'];
var jsonpId = Date.now(),
    cacheRand = Date.now() + 5,
    globalSerialize = null,
    globalDeserialize = null;

function createXhr() {
  var xhr = new XMLHttpRequest();
  Object.defineProperty(xhr, '_active', {
    value: false,
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
    xhr.requestURL = '';
    /* eslint-disable-next-line */
  } catch (e) {}

  events.forEach(function (v) {
    return xhr[v] = null;
  });
  xhr.upload && events.forEach(function (v) {
    return xhr.upload[v] = null;
  });
}

function xhrFactory() {
  for (var i = 0, len = xhrPool.length; i < len; ++i) {
    if (!xhrPool[i]._active) {
      return xhrPool[i];
    }
  }

  return createXhr();
}

function querystring(obj) {
  if (isObj(obj)) {
    return Object.keys(obj).map(function (k) {
      return Array.isArray(obj[k]) ? obj[k].map(function (v) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(v);
      }).join('&') : encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]);
    }).join('&');
  } else {
    return JSON.stringify(obj);
  }
}

function defaultSerialize(_ref) {
  var data = _ref.data,
      method = _ref.method,
      _ref$contentType = _ref.contentType,
      contentType = _ref$contentType === void 0 ? MIME.json : _ref$contentType,
      url = _ref.url,
      cache = _ref.cache;

  if (!cache) {
    url += ~url.indexOf('?') ? "&_=" + ++cacheRand : "?_=" + ++cacheRand;
  }

  if (method === 'GET' || method === 'HEAD') {
    return {
      url: url,
      data: data
    };
  }

  if (data instanceof Document || // URLSearchParams和ReadableStream暂时不考虑支持了, 浏览器版本要求比较高
  // data instanceof URLSearchParams ||
  // data instanceof ReadableStream ||
  data instanceof Blob || data instanceof FormData || data instanceof ArrayBuffer || data instanceof ArrayBufferView || typeof data === 'string') {
    return {
      url: url,
      data: data
    };
  }

  if (isJSON(contentType)) {
    data = JSON.stringify(data);
  } else if (isForm(contentType)) {
    data = querystring(data);
  } else {
    throw new TypeError('Unknown data type, you can provide a custom serialize function in options to override the default.');
  }

  return {
    url: url,
    data: data
  };
}

function defaultDeserialize(_ref2) {
  var data = _ref2.data,
      contentType = _ref2.contentType,
      acceptType = _ref2.acceptType;
  var rst = null;

  if (isStr(data) && (isJSON(contentType) || isJSON(acceptType))) {
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
}

function setHeaders(xhr, headers) {
  if (isObj(headers)) {
    Object.keys(headers).forEach(function (k) {
      return xhr.setRequestHeader(k, headers[k]);
    });
  }
}

function isolateTryCatch(_ref3) {
  var xhr = _ref3.xhr,
      reqData = _ref3.reqData,
      acceptType = _ref3.acceptType,
      dslz = _ref3.dslz,
      success = _ref3.success,
      error = _ref3.error,
      complete = _ref3.complete;

  // 这一坨有点恶心...考虑下怎么优化
  // 这里是为了捕获callback的异常, 以便最终可以reset
  try {
    var hasErrorCb = isFn(error),
        hasCompleteCb = isFn(complete),
        hasSuccessCb = isFn(success),
        errOccurred = false,
        resData = null; // 覆盖用户自定义

    xhr.onreadystatechange = function (e) {
      if (this.readyState === 4) {
        if (!(this.status >= 200 && this.status < 300 || this.status == 304) && this.status !== 0) {
          // 404之类的错误会在这里捕获, try-catch不能捕获
          errOccurred = true;

          if (!hasErrorCb && !hasCompleteCb) {
            throw new Error("Remote server error. Request URL: " + this.requestURL + ", Status code: " + this.status + ", message: " + this.statusText + ".");
          } // 异常不管直接抛


          hasErrorCb && error(new Error("Remote server error. Request URL: " + this.requestURL + ", Status code: " + this.status + ", message: " + this.statusText + "."), xhr, e);
          hasCompleteCb && complete(xhr, 'error');
        }
      }
    }; // 同步不触发onerror, 这里是为了捕获网络异常h和跨域异常


    try {
      xhr.send(reqData || null);
    } catch (e) {
      errOccurred = true; // 没有监听异常事件也不要吞掉异常, 跨域错误会在这里被捕获

      if (!hasErrorCb && !hasCompleteCb) {
        throw e;
      } // 异常不管直接抛


      hasErrorCb && error(e, xhr, null);
      hasCompleteCb && complete(xhr, 'error');
    }

    if (!errOccurred) {
      var resCtype = xhr.getResponseHeader('Content-Type'); // 这里也不捕获, 因为最外面已经捕获了

      resData = dslz({
        data: getResponse(xhr, 'responseXML') || getResponse(xhr, 'response') || getResponse(xhr, 'responseText'),
        contentType: resCtype,
        acceptType: acceptType
      }); // 异常直接抛, success不能在try中, 可能是success导致的异常进而使得控制流走向error

      hasSuccessCb && success(resData, xhr, null);
      hasCompleteCb && complete(xhr, 'success');
    } // loadend会在请求完成之后同步代码之前触发, 导致没办法依赖loadend来reset, 必须等到所有callback使用完xhr之后
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
    Object.keys(evts).filter(function (k) {
      return events.indexOf(k) !== -1;
    }).forEach(function (k) {
      return target[k] = evts[k];
    });
  }
}

function jsonp(options) {
  var url = options.url,
      _options$cache = options.cache,
      cache = _options$cache === void 0 ? false : _options$cache,
      crossorigin = options.crossorigin,
      callbackName = options.callbackName,
      success = options.success,
      beforeSend = options.beforeSend,
      complete = options.complete,
      error = options.error;
  var hasOriginalCb = isFn(window[callbackName]);

  if (isStr(callbackName) && !hasOriginalCb) {
    throw new Error(callbackName + " is not a function.");
  }

  var hasSuccessCb = isFn(success),
      hasErrorCb = isFn(error),
      hasCompleteCb = isFn(complete),
      originalCb = hasOriginalCb ? window[callbackName] : undefined;

  if (!hasSuccessCb && !hasCompleteCb & !hasOriginalCb) {
    throw new Error('Must set a success callback or complete callback.');
  }

  if (!isStr(url)) {
    throw new TypeError("url expected a non empty string, but received " + JSON.stringify(url) + ".");
  }

  var hasCustomCbName = isStr(callbackName),
      cbName = hasCustomCbName ? callbackName : "jsonp" + ++jsonpId,
      script = document.createElement('script');

  if (url.split('?').length < 3) {
    // 没有占位符的话默认callback
    var qs = "callback=" + encodeURIComponent(cbName);
    url = ~url.indexOf('?') ? url + "&" + qs : url + "?" + qs;
  } else {
    url = url.replace(/\?(.+)=\?/, "?$1=" + encodeURIComponent(cbName));
  }

  !cache && (url += "&_=" + ++cacheRand);

  if (!window[cbName] || !window[cbName].hasHook) {
    window[cbName] = function () {
      // 放前面, 防止后面的callback抛异常导致删不掉
      if (!hasCustomCbName) {
        delete window[cbName];
      }

      try {
        if (hasOriginalCb) {
          originalCb.apply(void 0, arguments);
        } else if (hasSuccessCb) {
          success.apply(void 0, arguments);
        }

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
    } // 都没有的话就继续抛出异常, 方便异常监控系统捕获


    if (!hasErrorCb && !hasCompleteCb) {
      throw new Error("Load script " + url + " failed.");
    }

    hasErrorCb && error(new Error("Load script " + url + " failed."), e);
    hasCompleteCb && complete('error');
  };

  script.onload = function () {
    return setTimeout(function () {
      return document.body.removeChild(script);
    }, 3000);
  };

  crossorigin && (script.crossOrigin = crossorigin);
  script.src = url;

  if (isFn(beforeSend)) {
    setTimeout(function () {
      // 允许拦截掉不发送请求
      var rst = beforeSend(url, options);
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

function ajax(options) {
  var _options$url = options.url,
      url = _options$url === void 0 ? location.href : _options$url,
      _options$method = options.method,
      method = _options$method === void 0 ? 'GET' : _options$method,
      reqCtype = options.contentType,
      beforeSend = options.beforeSend,
      complete = options.complete,
      reqRawData = options.data,
      _options$dataType = options.dataType,
      acceptType = _options$dataType === void 0 ? 'json' : _options$dataType,
      error = options.error,
      headers = options.headers,
      mimeType = options.mimeType,
      _options$responseType = options.responseType,
      responseType = _options$responseType === void 0 ? '' : _options$responseType,
      username = options.username,
      password = options.password,
      success = options.success,
      _options$timeout = options.timeout,
      timeout = _options$timeout === void 0 ? 0 : _options$timeout,
      ontimeout = options.ontimeout,
      events = options.events,
      uploadEvents = options.uploadEvents,
      _options$withCredenti = options.withCredentials,
      withCredentials = _options$withCredenti === void 0 ? false : _options$withCredenti,
      _options$cache2 = options.cache,
      cache = _options$cache2 === void 0 ? true : _options$cache2,
      serialize = options.serialize,
      deserialize = options.deserialize;
  method = method.toUpperCase().trim(); // IE是什么...
  // xhr不支持CONNECT, TRACE, TRACK方法

  if (!(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].indexOf(method) !== -1)) {
    throw new Error("Invalid HTTP method: " + method);
  } // 允许所有callback都没有
  // 准备数据


  if (isStr(reqCtype)) {
    MIME[reqCtype] && (reqCtype = MIME[reqCtype]);
  } else if (reqCtype) {
    throw new TypeError('contentType could be "json", "form", "html", "xml", "text" or other custom string.');
  }

  var slz = isFn(serialize) ? serialize : isFn(globalSerialize) ? globalSerialize : defaultSerialize,
      dslz = isFn(deserialize) ? deserialize : isFn(globalDeserialize) ? globalDeserialize : defaultDeserialize,
      protocol = /^([\w-]+:)\/\//.exec(url)[1],
      xhr = xhrFactory(),
      hasCompleteCb = isFn(complete),
      hasErrorCb = isFn(error),
      hasSuccessCb = isFn(success);
  var reqData,
      errCalled = false,
      completeCalled = false; // 这里不用捕获异常去重置xhr是因为xhr还没激活

  var _slz = slz({
    data: reqRawData,
    method: method,
    contentType: reqCtype,
    url: url,
    cache: cache
  });

  url = _slz.url;
  reqData = _slz.data;
  // 初始化xhr
  xhr._active = true;
  xhr.open(method, url, true, username, password);
  !xhr.requestURL && (xhr.requestURL = url); // 设置必要的头部

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
  isStr(mimeType) && xhr.overrideMimeType(mimeType); // 主要是给progress等事件用, 但存在破坏封装的风险

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
        throw new Error("Request " + this.requestURL + " timeout.");
      }
    };
  } // loadend无论同步还是异步请求, 无论前面的事件是否抛异常, 它都会执行


  if (isFn(xhr.onloadend)) {
    var originalLoadend = xhr.onloadend;

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
      if (this.status >= 200 && this.status < 300 || this.status == 304 || this.status == 0 && protocol == 'file:') {
        var resCtype = this.getResponseHeader('Content-Type'); // 这里也不用捕获异常, 因为xhr.onloadend会在之后帮我们回收xhr

        var resData = dslz({
          data: getResponse(xhr, 'responseXML') || getResponse(xhr, 'response') || getResponse(xhr, 'responseText'),
          contentType: resCtype,
          acceptType: acceptType
        }); // 异常直接抛

        hasSuccessCb && success(resData, this, e);
        hasCompleteCb && complete(this, 'success');
      } else if (this.status !== 0) {
        // 这类错误xhr.onerror和window.onerror都不捕获所以手动抛一个
        if (!hasErrorCb && !hasCompleteCb) {
          throw new Error("Remote server error. Request URL: " + this.requestURL + ", Status code: " + this.status + ", message: " + this.statusText + ".");
        } // 理论上来讲好像没必要再注册xhr.onerror了, 因为如果有error那status必然为0
        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/status
        // 但是不加个心里不踏实...总感觉会不会有浏览器没按规范实现
        // 不过知名的库页都没监听onerror, 那说明应该是都按规范实现了的
        // 但是我要加!!!


        if (hasErrorCb) {
          errCalled = true;
          error(new Error("Remote server error. Request URL: " + this.requestURL + ", Status code " + this.status), this, e);
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
    if (!hasErrorCb && !hasCompleteCb) {
      throw new Error("An error occurred, maybe crossorigin error. Request URL: " + this.requestURL + ", Status code: " + this.status + ".");
    }

    if (!errCalled && hasErrorCb) {
      error(new Error("Network error or browser restricted. Request URL: " + this.requestURL + ", Status code: " + this.status), this, e);
    }

    if (!completeCalled && hasCompleteCb) {
      complete(this, 'error');
    }
  }; // 哎...都异步吧


  if (isFn(beforeSend)) {
    setTimeout(function () {
      var rst;

      try {
        rst = beforeSend(xhr, options);
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
    abort: function abort() {
      xhr.abort();
    }
  };
}

function ajaxSync(options) {
  // 同步请求忽略timeout, responseType, withCredentials, 否则报错
  // 同步请求的callback都同步调用, 支持callback只是为了API保持一致
  var _options$url2 = options.url,
      url = _options$url2 === void 0 ? location.href : _options$url2,
      _options$method2 = options.method,
      method = _options$method2 === void 0 ? 'GET' : _options$method2,
      reqCtype = options.contentType,
      beforeSend = options.beforeSend,
      complete = options.complete,
      reqRawData = options.data,
      _options$dataType2 = options.dataType,
      acceptType = _options$dataType2 === void 0 ? 'json' : _options$dataType2,
      error = options.error,
      headers = options.headers,
      mimeType = options.mimeType,
      username = options.username,
      password = options.password,
      success = options.success,
      events = options.events,
      uploadEvents = options.uploadEvents,
      _options$cache3 = options.cache,
      cache = _options$cache3 === void 0 ? true : _options$cache3,
      serialize = options.serialize,
      deserialize = options.deserialize;
  method = method.toUpperCase().trim(); // IE是什么...
  // xhr不支持CONNECT, TRACE, TRACK方法

  if (!(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].indexOf(method) !== -1)) {
    throw new Error("Invalid HTTP method: " + method);
  } // 允许所有callback都没有
  // 准备数据


  if (isStr(reqCtype)) {
    MIME[reqCtype] && (reqCtype = MIME[reqCtype]);
  } else if (reqCtype) {
    throw new TypeError('contentType could be "json", "form", "html", "xml", "text" or other custom string.');
  }

  var slz = isFn(serialize) ? serialize : isFn(globalSerialize) ? globalSerialize : defaultSerialize,
      dslz = isFn(deserialize) ? deserialize : isFn(globalDeserialize) ? globalDeserialize : defaultDeserialize,
      xhr = xhrFactory();
  var reqData;

  var _slz2 = slz({
    data: reqRawData,
    method: method,
    contentType: reqCtype,
    url: url,
    cache: cache
  });

  url = _slz2.url;
  reqData = _slz2.data;
  // 初始化xhr
  xhr._active = true;
  xhr.open(method, url, false, username, password);
  !xhr.requestURL && (xhr.requestURL = url); // 设置必要的头部

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
  isStr(mimeType) && xhr.overrideMimeType(mimeType); // 主要是给progress等事件用, 但存在破坏封装的风险

  setEvents(xhr, events);
  setEvents(xhr.upload, uploadEvents);

  if (isFn(beforeSend)) {
    var rst;

    try {
      rst = beforeSend(xhr, options);
    } catch (e) {
      resetXhr(xhr);
      throw e;
    }

    if (rst !== false) {
      return isolateTryCatch({
        xhr: xhr,
        reqData: reqData,
        acceptType: acceptType,
        dslz: dslz,
        success: success,
        error: error,
        complete: complete
      });
    } else {
      resetXhr(xhr);
    }
  } else {
    return isolateTryCatch({
      xhr: xhr,
      reqData: reqData,
      acceptType: acceptType,
      dslz: dslz,
      success: success,
      error: error,
      complete: complete
    });
  }
}

function config(_temp) {
  var _ref4 = _temp === void 0 ? {} : _temp,
      _ref4$pool = _ref4.pool,
      pool = _ref4$pool === void 0 ? false : _ref4$pool,
      serialize = _ref4.serialize,
      deserialize = _ref4.deserialize;

  if (pool) {
    xhrPool.length = 0;
    var poolSize = typeof pool === 'number' ? pool : 5;

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
function get(url, options) {
  return ajax(_extends({}, options, {
    url: url,
    method: 'GET'
  }));
}
function head(url, options) {
  return ajax(_extends({}, options, {
    url: url,
    method: 'HEAD'
  }));
}
function post(url, data, options) {
  return ajax(_extends({}, options, {
    url: url,
    data: data,
    method: 'POST'
  }));
}
function put(url, data, options) {
  return ajax(_extends({}, options, {
    url: url,
    data: data,
    method: 'PUT'
  }));
}
function del(url, data, options) {
  return ajax(_extends({}, options, {
    url: url,
    data: data,
    method: 'DELETE'
  }));
}
function patch(url, data, options) {
  return ajax(_extends({}, options, {
    url: url,
    data: data,
    method: 'PATCH'
  }));
}
function options(url, data, options) {
  return ajax(_extends({}, options, {
    url: url,
    data: data,
    method: 'OPTIONS'
  }));
}

export { config, ajax, ajaxSync, jsonp, get, head, post, put, del, patch, options };
//# sourceMappingURL=tinyjx.esm.js.map
