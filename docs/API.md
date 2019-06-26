## API

### ajax(options: AsyncOptions): Abortable

Returns a `Abortable` object which implemented a `abort()` method like `xhr.abort()`.

#### AsyncOptions: Object

- `url`: `<string>`, URL to request

- `method`: `<string>`, HTTP method, case insensitive, default `"GET"`, only `GET`, `HEAD`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS` supported.

- `contentType`: `<string>`, MIME type for request body, also support predefined value `json`, `form`,  `html`, `xml`, `text`, which are `application/json`, `application/x-www-form-urlencoded`, `text/html`, `application/xml`, `text/plain`, default `json`

- `dataType`: `<string>`, MIME type expect from ther server, will be treat as `Accept`, default `json`

- `headers`: request headers, which is a key-value object. eg. `{'Content-Type': 'text/plain'}`

- `cache`: allow browser to cache responses, default `true`

- `responseType`: specifies the `xhr.responseType`

- `mimeType`: specifies the parameters of `xhr.overrideMimeType()`

- `withCredentials`: specifies the `xhr.withCredentials`

- `timeout`: specifies the `xhr.timeout`

- `username`: user name to use for authentication

- `password`: password to use for authentication

- `events`: events of [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest), except of `onerror` and `onreadystatechange`, which will be  overriden by tinyjx. eg.

  ```javascript
  {
      onprogress(e) {},
      onload(e) {}
  }
  ```

- `uploadEvents`: events of [XMLHttpRequestUpload](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/upload)

- `beforeSend(xhr, options)`: `<Function>`, before the request is sent. `options` is `AsyncOptions`.  Return `false` will cancel the request

- `success(data, xhr, event)`: `<Function>`, when request succeeds

- `recoverableError(err, data, xhr, event)`: `<Function>`, when request error occurred, such as response status is 404, 500, which means browser received the response, but an error occurred from remote server

- `unrecoverableError(err, xhr, event)`: `<Function>`, different from `recoverableError`, which means request is failed or browser didn't receive any response, such as cross origin error or network error

- `complete(xhr, status)`: `<Function>`, after `success()` or `error()`, note if `success()` or `error()` throws an error, `complete()` will not be called

- `ontimeout(event)`: `<Function>`, similar with `xhr.ontimeout`, but `this` is null

- `serialize`: `<Function>`, specifies a serialize method for this request, returns an object which contains `url` and `data`. `options` contains: 

  - `data`: raw data in `AsyncOptions`
  - `url`: `<string>`, request URL
  - `method`: `<string>`, HTTP method of request
  - `contentType`: `<string>`, MIME type of `data` 
  - `cache`: `<boolean>`, `cache` in `AsyncOptions`, allow browser to cache responses



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

- `deserialize`: `<Function>`, specifies a deserialize method for all responses, returns anything what you want which will be the `data` of `success` callback. `options` contains: 
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

- `url`: URL to request
- `cache`: `<boolean>`, allow browser to cache responses, default `false`
- `crossorigin`: `crossorigin` attribute of `<script>`, default isn't set
- `callbackName`: `<string>`, custom callback name, default `jsonp${randomId}`
- `beforeSend(url, options)`: `<Function>`, before the request is sent. `options` is `JsonpOptions`.  Return `false` will cancel the request
- `success(args)`: `<Function>`, when request succeeds
- `error(err, event)`: `<Function>`, when error occurred
- `complete(status)`: `<Function>`, after `success()` or `error()`, note if `success()` or `error()` throws an error, `complete()` will not be called



### config(options: ConfigOptions): void

Returns `undefined`.

#### ConfigOptions: Object

- `pool`: `<number> | <boolean>`, specifies the size of xhr pool, default `false`, will not use xhr pool. If `true`, default size is 5
- `serialize(options)`: `<Function>`, specifies a serialize method for all requests, returns an object which contains `url` and `data`. `options` contains: 
  - `data`: raw data in `AsyncOptions`
  - `url`: `<string>`, request URL
  - `method`: `<string>`, HTTP method of request
  - `contentType`: `<string>`, MIME type of `data` 
  - `cache`: `<boolean>`, `cache` in `AsyncOptions`, allow browser to cache responses
- `deserialize(options)`: `<Function>`, specifies a deserialize method for all responses, returns anything what you want which will be the `data` of `success` callback. `options` contains: 
  - `data`: raw data in response, may be `xhr.responseXML`, `xhr.response` or `xhr.responseText`
  - `contentType`: `Content-Type` header of response
  - `acceptType`: `Accept` of request



### get(url: string, options: AsyncOptions): Abortable

A `GET` request wrapper of `ajax()`.



### head(url: string, options: AsyncOptions): Abortable

A `HEAD` request wrapper of `ajax()`.



### post(url: string, data: any, options: AsyncOptions): Abortable

A `POST` request wrapper of `ajax()`.



### put(url: string, data: any, options: AsyncOptions): Abortable

A `PUT` request wrapper of `ajax()`.



### patch(url: string, data: any, options: AsyncOptions): Abortable

A `PATCH` request wrapper of `ajax()`.



### del(url: string, data: any, options: AsyncOptions): Abortable

A `DELETE` request wrapper of `ajax()`.



### options(url: string, data: any, options: AsyncOptions): Abortable

A `OPTIONS` request wrapper of `ajax()`.