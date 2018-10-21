module.exports = {
	'get /ajax': {
		data: 'get'
	},
	'post /ajax': {
		data: 'post'
	},
	'patch /ajax': {
		data: 'patch'
	},
	'put /ajax': {
		data: 'put'
	},
	'delete /ajax': {
		data: 'delete'
	},
	'options /ajax': {
		data: 'options'
	},
	'head /ajax': {
		data: 'head'
	},
	'get /ajaxSync 2000': {
		data: 'get'
	},
	'post /ajaxSync 2000': {
		data: 'post'
	},
	'patch /ajaxSync 2000': {
		data: 'patch'
	},
	'put /ajaxSync 2000': {
		data: 'put'
	},
	'delete /ajaxSync 2000': {
		data: 'delete'
	},
	'options /ajaxSync 2000': {
		data: 'options'
	},
	'head /ajaxSync 2000': {
		data: 'head'
	},
	'get /jsonp': async (req, res) => {
		const callback = req.query.callback, cache = req.query.cache;
		if (cache == 0) {
			return `${decodeURIComponent(callback)}(${Math.random()})`;
		} else {
			return `${decodeURIComponent(callback)}({hello: "world"})`;
		}
	}
};