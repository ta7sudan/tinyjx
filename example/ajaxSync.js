// tinyjx.ajaxSync({});

// const data = tinyjx.ajaxSync({
// 	url: 'http://127.0.0.1:8080/ajaxSync',
// 	method: 'get',
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr);
// 		console.log(e);
// 	}
// });
// console.log(data);


// const data = tinyjx.ajaxSync({
// 	url: 'http://127.0.0.1:8080/ajaxSync',
// 	method: 'post',
// 	data: {
// 		hello: 'world'
// 	},
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr);
// 		console.log(e);
// 	}
// });
// console.log(data);


// const data = tinyjx.ajaxSync({
// 	url: 'http://127.0.0.1:8080/ajaxSync',
// 	method: 'put',
// 	data: {
// 		hello: 'world'
// 	},
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr);
// 		console.log(e);
// 	}
// });
// console.log(data);

// const data = tinyjx.ajaxSync({
// 	url: 'http://127.0.0.1:8080/ajaxSync',
// 	method: 'patch',
// 	data: {
// 		hello: 'world'
// 	},
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr);
// 		console.log(e);
// 	}
// });
// console.log(data);


// const data = tinyjx.ajaxSync({
// 	url: 'http://127.0.0.1:8080/ajaxSync',
// 	method: 'delete',
// 	data: {
// 		hello: 'world'
// 	},
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr);
// 		console.log(e);
// 	}
// });
// console.log(data);


// const data = tinyjx.ajaxSync({
// 	url: 'http://127.0.0.1:8080/ajaxSync',
// 	method: 'options',
// 	data: {
// 		hello: 'world'
// 	},
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr);
// 		console.log(e);
// 	}
// });
// console.log(data);


// const data = tinyjx.ajaxSync({
// 	url: 'http://127.0.0.1:8080/ajaxSync',
// 	method: 'head',
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr);
// 		console.log(e);
// 	}
// });
// console.log(data);


// const data = tinyjx.ajaxSync({
// 	url: 'http://127.0.0.1:8080/ajaxSync',
// 	method: 'post',
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr);
// 		console.log(e);
// 	}
// });
// console.log(data);


// const data = tinyjx.ajaxSync({
// 	url: 'http://127.0.0.1:8080/ajaxSync',
// 	method: 'post',
// 	data: {
// 		测试: '测试',
// 		test: [1, 2, 3],
// 		demo: {
// 			name: 'demo'
// 		}
// 	},
// 	contentType: 'form',
// 	headers: {
// 		'Custom-Header': 'test'
// 	},
// 	success(data, xhr, e) {
// 		console.log(data);
// 		console.log(xhr);
// 		console.log(e);
// 	},
// 	error(err, xhr, e) {
// 		console.log(err.message);
// 		console.log(xhr);
// 		console.log(e);
// 	},
// 	complete(xhr, status) {
// 		console.log(xhr);
// 		console.log(status);
// 	}
// });
// console.log(data);

const data = tinyjx.ajaxSync({
	url: 'http://127.0.0.1:8080/ajaxSync',
	method: 'post',
	data: {
		测试: '测试',
		test: [1, 2, 3],
		demo: {
			name: 'demo'
		}
	},
	contentType: 'json',
	success(data, xhr, e) {
		console.log(data);
		console.log(xhr);
		console.log(e);
	},
	error(err, xhr, e) {
		console.log(err.message);
		console.log(xhr);
		console.log(e);
	},
	complete(xhr, status) {
		console.log(xhr);
		console.log(status);
	}
});
console.log(data);