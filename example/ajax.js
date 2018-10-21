tinyjx.config({
	pool: 10
});

tinyjx.ajax({
	url: 'http://127.0.0.1:8080/ajax',
	method: 'get',
	success(data, xhr, e) {
		console.log(data);
		console.log(xhr._id);
		console.log(e);
	}
});

tinyjx.ajax({
	url: 'http://127.0.0.1:8080/ajax',
	method: 'head',
	success(data, xhr, e) {
		console.log(data);
		console.log(xhr._id);
		console.log(e);
	}
});


tinyjx.ajax({
	url: 'http://127.0.0.1:8080/ajax',
	method: 'post',
	success(data, xhr, e) {
		console.log(data);
		console.log(xhr._id);
		console.log(e);
	}
});


tinyjx.ajax({
	url: 'http://127.0.0.1:8080/ajax',
	method: 'put',
	success(data, xhr, e) {
		console.log(data);
		console.log(xhr._id);
		console.log(e);
	}
});

tinyjx.ajax({
	url: 'http://127.0.0.1:8080/ajax',
	method: 'patch',
	success(data, xhr, e) {
		console.log(data);
		console.log(xhr._id);
		console.log(e);
	}
});

tinyjx.ajax({
	url: 'http://127.0.0.1:8080/ajax',
	method: 'delete',
	success(data, xhr, e) {
		console.log(data);
		console.log(xhr._id);
		console.log(e);
	}
});

tinyjx.ajax({
	url: 'http://127.0.0.1:8080/ajax',
	method: 'options',
	success(data, xhr, e) {
		console.log(data);
		console.log(xhr._id);
		console.log(e);
	}
});
