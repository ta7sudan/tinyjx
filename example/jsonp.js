// tinyjx.jsonp({});


// tinyjx.jsonp({
// 	success(data) {
// 		console.log(data);
// 	}
// });

// tinyjx.jsonp({
// 	url: 'http://127.0.0.1:8080/jsonp',
// 	success(data) {
// 		console.log(data);
// 	}
// });


// tinyjx.jsonp({
// 	url: 'http://127.0.0.1:8080/jsonp?aaa=1&callback=?&bbb=2',
// 	success(data) {
// 		console.log(data);
// 	}
// });


// tinyjx.jsonp({
// 	url: 'http://127.0.0.1:8080/jsonp?aaa=1',
// 	success(data) {
// 		console.log(data);
// 	}
// });

// tinyjx.jsonp({
// 	url: 'http://127.0.0.1:8080/jsonp?aaa=1&callback=?&bbb=2',
// 	callbackName: '测试',
// 	success(data) {
// 		console.log(data);
// 	}
// });

// function test(data) {
// 	console.log(data);
// }
// tinyjx.jsonp({
// 	url: 'http://127.0.0.1:8080/jsonp?cache=0',
// 	cache: true,
// 	callbackName: 'test'
// });
// tinyjx.jsonp({
// 	url: 'http://127.0.0.1:8080/jsonp?cache=0',
// 	cache: true,
// 	callbackName: 'test'
// });


// function test(data) {
// 	console.log(data);
// }
// tinyjx.jsonp({
// 	url: 'http://127.0.0.1:8080/jsonp?cache=0',
// 	callbackName: 'test'
// });
// tinyjx.jsonp({
// 	url: 'http://127.0.0.1:8080/jsonp?cache=0',
// 	callbackName: 'test'
// });


// tinyjx.jsonp({
// 	url: 'http://127.0.0.1:8080/jsonp',
// 	beforeSend(url, options) {
// 		console.log(url);
// 		console.log(options);
// 	},
// 	success(data) {
// 		console.log(data);
// 	}
// });

// tinyjx.jsonp({
// 	url: 'http://127.0.0.1:8080/jsonp',
// 	beforeSend(url, options) {
// 		console.log(url);
// 		console.log(options);
// 		return false;
// 	},
// 	success(data) {
// 		console.log(data);
// 	}
// });

// tinyjx.jsonp({
// 	url: 'http://127.0.0.1:8080/jsop',
// 	success(data) {
// 		console.log(data);
// 	}
// });

// tinyjx.jsonp({
// 	url: 'http://127.0.0.1:8080/jsop',
// 	success(data) {
// 		console.log(data);
// 	},
// 	error(err, e) {
// 		console.log(err);
// 		console.log(e);
// 	}
// });


// tinyjx.jsonp({
// 	url: 'http://127.0.0.1:8080/jsop',
// 	complete(status) {
// 		console.log(status);
// 	}
// });


// tinyjx.jsonp({
// 	url: 'http://127.0.0.1:8080/jsop',
// 	error(err, e) {
// 		console.log(err.message);
// 		console.log(e);
// 	},
// 	complete(status) {
// 		console.log(status);
// 	}
// });

// tinyjx.jsonp({
// 	url: 'http://127.0.0.1:8080/jsonp',
// 	crossorigin: 'anonymous',
// 	success(data) {
// 		console.log(data);
// 	},
// 	error(err, e) {
// 		console.log(err.message);
// 		console.log(e);
// 	}
// });

tinyjx.jsonp({
	url: 'http://127.0.0.1:8080/jsonp',
	beforeSend(url, options) {
		console.log(url);
		console.log(options);
	},
	success(data) {
		console.log(data);
	},
	error(err, e) {
		console.log(err.message);
		console.log(e);
	},
	complete(status) {
		console.log(status);
	}
});
