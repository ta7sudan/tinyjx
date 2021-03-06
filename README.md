# tinyjx
<!-- [START badges] -->
![Travis (.org) branch](https://img.shields.io/travis/ta7sudan/tinyjx/next.svg) [![GitHub license](https://img.shields.io/github/license/ta7sudan/tinyjx.svg)](https://github.com/ta7sudan/tinyjx/blob/next/LICENSE) ![npm (tag)](https://img.shields.io/npm/v/tinyjx/next.svg)
<!-- [END badges] -->

tinyjx is a tiny http client for browser.



## Summary

* Tree shaking friendly
* Error tracking friendly
* Small file size (with tree shaking only 5kb minified and 2kb gzip)
* Xhr pool
* Types supported
* IE 10+



## Install

```shell
$ npm i -P tinyjx@next
```



## Usage

```javascript
import { ajax } from 'tinyjx';
ajax({
    url: 'http://127.0.0.1/test',
    method: 'post',
    data: {
        hello: world
    },
    success(data, xhr, event) {
        console.log(data);
    },
    complete(xhr, status) {
        console.log(status);
    }
})
```



## API

### ajax(options: AjaxOptions): Abortable

Returns a `Abortable` object which implemented a `abort()` method like `xhr.abort()`.

#### AjaxOptions: Object

* `url`: `<string>`, URL to request

* `method`: `<string>`, HTTP method, case insensitive, default `"GET"`, only `GET`, `HEAD`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS` supported.

* `data`: `<any>`, request data, used by `POST`, `PUT`, `PATCH`

* `contentType`: `<string>`, MIME type for request body, also support predefined value `json`, `form`,  `html`, `xml`, `text`, which are `application/json`, `application/x-www-form-urlencoded`, `text/html`, `application/xml`, `text/plain`, default `json`

* `dataType`: `<string>`, MIME type expect from the remote server, will be treat as `Accept`, default `json`

* `headers`: request headers, which is a key-value object. eg. `{'Content-Type': 'text/plain'}`

* `mimeType`: specifies the parameters of `xhr.overrideMimeType()`

* `username`: user name to use for authentication

* `password`: password to use for authentication

* `events`: events of [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest), except of `onerror` and `onreadystatechange`, which will be  overriden by tinyjx. eg.

  ```javascript
  {
      onprogress(e) {},
      onload(e) {}
  }
  ```

* `uploadEvents`: events of [XMLHttpRequestUpload](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/upload)

* `cache`: allow browser to cache responses, default `true`

* `responseType`: specifies the `xhr.responseType`

* `timeout`: specifies the `xhr.timeout`

* `withCredentials`: specifies the `xhr.withCredentials`

* `beforeSend(xhr, options)`: `<Function>`, before the request is sent. `options` is `AjaxOptions`.  Return `false` will cancel the request

* `success(respData, xhr, event)`: `<Function>`, when request succeeds

* `recoverableError(err, respData, xhr, event)`: `<Function>`, when request error occurred, such as response status is 404, 500, which means browser received the response, but an error occurred from remote server

* `unrecoverableError(err, xhr, event)`: `<Function>`, different from `recoverableError`, which means request is failed or browser didn't receive any response, such as cross origin error or network error

* `complete(xhr, status)`: `<Function>`, after `success()` or `error()`, note if `success()` or `error()` throws an error, `complete()` will not be called

* `ontimeout(event)`: `<Function>`, similar with `xhr.ontimeout`, but `this` is null

* `serialize`: `<Function>`, specifies a serialize method for this request, returns an object which contains `url` and `data`. `options` contains: 

  - `data`: raw data(`data`) in `AjaxOptions`
  - `url`: `<string>`, request URL
  - `method`: `<string>`, HTTP method of request
  - `contentType`: `<string>`, MIME type of `data` 
  - `cache`: `<boolean>`, `cache` in `AjaxOptions`, allow browser to cache response



  ```javascript
  ajax({
  	url: 'http://127.0.0.1:8080/ajax',
  	data: {
  		a: 1,
  		b: 2
  	},
  	serialize({data, method, contentType, url, cache}) {
  		url += '?' + Object.keys(data).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`).join('&');
  		return {
  			url,
  			data: {
  				hello: 'world'
  			}
  		};
  	}
  });
  // The request URL will be http://127.0.0.1:8080/ajax?a=1&b=2
  // with body {"hello": "world"}
  ```

* `deserialize`: `<Function>`, specifies a deserialize method for all responses, returns anything what you want which will be the `data` of `success` callback. `options` contains: 

  - `data`: raw data in response, may be `xhr.responseXML`, `xhr.response` or `xhr.responseText`
  - `contentType`: `Content-Type` header of response
  - `acceptType`: `Accept` of request



  ```javascript
  ajax({
  	url: 'http://127.0.0.1:8080/ajax',
  	deserialize({data, contentType, acceptType}) {
  		console.log(data); // {"hello": "world"}
  		console.log(contentType);
  		console.log(acceptType);
  		return 'data changed';
  	},
  	success(data, xhr, e) {
  		console.log(data); // data changed
  	}
  });
  ```



### jsonp(options: JsonpOptions): void

Returns `undefined`.

#### JsonpOptions: Object

* `url`: URL to request
* `cache`: `<boolean>`, allow browser to cache responses, default `false`
* `crossorigin`: `crossorigin` attribute of `<script>`, default isn't set
* `callbackName`: `<string>`, custom callback name, default `jsonp${randomId}`
* `beforeSend(url, options)`: `<Function>`, before the request is sent. `options` is `JsonpOptions`.  Return `false` will cancel the request
* `success(args)`: `<Function>`, when request succeeds
* `error(err, event)`: `<Function>`, when error occurred
* `complete(status)`: `<Function>`, after `success()` or `error()`, note if `success()` or `error()` throws an error, `complete()` will not be called



### config(options: ConfigOptions): void

Returns `undefined`.

#### ConfigOptions: Object

- `pool`: `<number> | <boolean>`, specifies the size of xhr pool, default `false`, will not use xhr pool. If `true`, default size is 5
- `serialize(options)`: `<Function>`, specifies a serialize method for all requests, returns an object which contains `url` and `data`. `options` contains: 
  - `data`: raw data in `AjaxOptions`
  - `url`: `<string>`, request URL
  - `method`: `<string>`, HTTP method of request
  - `contentType`: `<string>`, MIME type of `data` 
  - `cache`: `<boolean>`, `cache` in `AjaxOptions`, allow browser to cache responses
- `deserialize(options)`: `<Function>`, specifies a deserialize method for all responses, returns anything what you want which will be the `data` of `success` callback. `options` contains: 
  - `data`: raw data in response, may be `xhr.responseXML`, `xhr.response` or `xhr.responseText`
  - `contentType`: `Content-Type` header of response
  - `acceptType`: `Accept` of request



### get(url: string, options: AjaxOptions): Abortable

A `GET` request wrapper of `ajax()`.



### head(url: string, options: AjaxOptions): Abortable

A `HEAD` request wrapper of `ajax()`.



### post(url: string, data: any, options: AjaxOptions): Abortable

A `POST` request wrapper of `ajax()`.



### put(url: string, data: any, options: AjaxOptions): Abortable

A `PUT` request wrapper of `ajax()`.



### patch(url: string, data: any, options: AjaxOptions): Abortable

A `PATCH` request wrapper of `ajax()`.



### del(url: string, data: any, options: AjaxOptions): Abortable

A `DELETE` request wrapper of `ajax()`.



### options(url: string, data: any, options: AjaxOptions): Abortable

A `OPTIONS` request wrapper of `ajax()`.



## TODO

* More test 



## License

Licensed under the [MIT License](https://kbrsh.github.io/license/).




