// tinyjx.config({
// 	pool: 5
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	method: 'get',
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr._id);
// 		console.log(e);
// 	}
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	method: 'head',
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr._id);
// 		console.log(e);
// 	}
// });


// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	method: 'post',
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr._id);
// 		console.log(e);
// 	}
// });


// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	method: 'put',
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr._id);
// 		console.log(e);
// 	}
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	method: 'patch',
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr._id);
// 		console.log(e);
// 	}
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	method: 'delete',
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr._id);
// 		console.log(e);
// 	}
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	method: 'options',
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr._id);
// 		console.log(e);
// 	}
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	method: 'test'
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	contentType: 123
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	contentType: 'json'
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	contentType: 'form'
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	contentType: 'html'
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	contentType: 'xml'
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	contentType: 'text'
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	dataType: 'json'
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	dataType: 'text'
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	dataType: 'html'
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	dataType: 'xml'
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	data: {
// 		a: 1,
// 		b: 2
// 	},
// 	serialize({data, method, contentType, url, cache}) {
// 		console.log(data);
// 		console.log(method);
// 		console.log(contentType);
// 		console.log(url);
// 		console.log(cache);
// 		url += '?' + Object.keys(data).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`).join('&');
// 		return {
// 			url,
// 			data
// 		};
// 	}
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	deserialize({data, contentType, acceptType}) {
// 		console.log(data);
// 		console.log(contentType);
// 		console.log(acceptType);
// 		return 'data changed';
// 	},
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr);
// 		console.log(e);
// 	}
// });


// tinyjx.config({
// 	serialize({data, method, contentType, url, cache}) {
// 		console.log(data);
// 		console.log(method);
// 		console.log(contentType);
// 		console.log(url);
// 		console.log(cache);
// 		url += '?' + Object.keys(data).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`).join('&');
// 		return {
// 			url,
// 			data
// 		};
// 	}
// });
// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	data: {
// 		a: 1,
// 		b: 2
// 	}
// });


// tinyjx.config({
// 	deserialize({data, contentType, acceptType}) {
// 		console.log(data);
// 		console.log(contentType);
// 		console.log(acceptType);
// 		return 'data changed';
// 	}
// });
// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr);
// 		console.log(e);
// 	}
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	username: 'test',
// 	password: 'aaa',
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr);
// 		console.log(e);
// 	}
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	headers: {
// 		'Custom-Header0': 'test',
// 		'Custom-Header1': 'test'
// 	},
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr);
// 		console.log(e);
// 	}
// });

// window.onerror = function (msg) {
// 	console.log(msg);
// };
// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajaxa'
// });

// window.onerror = function (msg) {
// 	console.log(msg);
// };
// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajaxa',
// 	error(err, xhr, e) {
// 		console.log(err.message);
// 		console.log(xhr);
// 		console.log(e);
// 	}
// });

// window.onerror = function (msg) {
// 	console.log(msg);
// };
// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajaxa',
// 	complete(xhr, status) {
// 		console.log(xhr);
// 		console.log(status);
// 	}
// });


// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajaxdelay',
// 	method: 'post',
// 	timeout: 1000,
// 	complete(xhr, status) {
// 		console.log(xhr);
// 		console.log(status);
// 	}
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajaxdelay',
// 	method: 'post',
// 	timeout: 1000,
// 	ontimeout(e) {
// 		console.log(e);
// 	},
// 	complete(xhr, status) {
// 		console.log(xhr);
// 		console.log(status);
// 	}
// });

// tinyjx.ajax({
// 	url: 'http://127.0.0.1:8080/ajax',
// 	cache: false
// });

tinyjx.ajax({
	url: 'http://127.0.0.1:8080/ajax',
	beforeSend(xhr, options) {
		console.log(xhr);
		console.log(options);
		return false;
	}
});