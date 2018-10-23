module.exports = {
	'post /ajaxdelay 3000': {
		data: 'post'
	},
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
	'get /jsonp': async (req, res) => {
		const callback = req.query.callback, cache = req.query.cache;
		if (cache == 0) {
			return `${decodeURIComponent(callback)}(${Math.random()})`;
		} else {
			return `${decodeURIComponent(callback)}({hello: "world"})`;
		}
	}
};