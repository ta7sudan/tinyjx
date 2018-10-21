import test from 'ava';
import puppeteerHelper from './_puppeteer';
import './_pock';

/* global tinyjx */

/**
 * AVA 默认不处理src下面的文件, 所以需要@babel/register
 * 对于async, 还需要@babel/polyfill, 这些都在package.json中配置
 * 另外由于tree shaking的需要, 全局的babel配置是不会将ES module
 * 语法转换成CommonJS的(modules: false), 所以需要覆盖掉全局babel配置
 */

const sleep = time => new Promise(rs => setTimeout(rs, time));
const isObj = o => Object.prototype.toString.call(o) === '[object Object]';

test('jsonp empty args', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:3000/test.html');
	const result = page.evaluate(() => {
		tinyjx.jsonp({});
	});
	await t.throwsAsync(result, /Must set a success callback or complete callback./);
});


test('jsonp without url', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:3000/test.html');
	const result = page.evaluate(() => {
		tinyjx.jsonp({
			success(data) {
				console.log(data);
			}
		});
	});
	await t.throwsAsync(result, /url expected a non empty string, but received/);
});

test('jsonp only success', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:3000/test.html');
	const result = await page.evaluate(() => new Promise(rs => {
		tinyjx.jsonp({
			url: 'http://127.0.0.1:8080/jsonp',
			success(data) {
				rs(data);
			}
		});
	}));
	t.deepEqual(result, {
		hello: 'world'
	});
});


test('jsonp url with placeholder', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:3000/test.html');
	const result = await page.evaluate(() => new Promise(rs => {
		tinyjx.jsonp({
			url: 'http://127.0.0.1:8080/jsonp?aaa=1&callback=?&bbb=2',
			success(data) {
				rs(data);
			}
		});
	}));
	t.deepEqual(result, {
		hello: 'world'
	});
});


test('jsonp url with query', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:3000/test.html');
	const result = await page.evaluate(() => new Promise(rs => {
		tinyjx.jsonp({
			url: 'http://127.0.0.1:8080/jsonp?aaa=1',
			success(data) {
				rs(data);
			}
		});
	}));
	t.deepEqual(result, {
		hello: 'world'
	});
});


test('jsonp with custom callbackName and url with placeholder', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:3000/test.html');
	const result = await page.evaluate(() => new Promise(rs => {
		window['测试'] = function (data) {
			rs(data);
		};
		tinyjx.jsonp({
			url: 'http://127.0.0.1:8080/jsonp?aaa=1&callback=?&bbb=2',
			callbackName: '测试'
		});
	}));
	t.deepEqual(result, {
		hello: 'world'
	});
});


test('jsonp with cache', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:3000/test.html');
	const result = await page.evaluate(() => {
		const rst = [];
		return new Promise(rs => {
			let i = 0;
			window.test = function (data) {
				rst[i++] = data;
				console.log(i);
				i === 2 && rs(rst);
			};
			tinyjx.jsonp({
				url: 'http://127.0.0.1:8080/jsonp?cache=0',
				cache: true,
				callbackName: 'test'
			});
			tinyjx.jsonp({
				url: 'http://127.0.0.1:8080/jsonp?cache=0',
				cache: true,
				callbackName: 'test'
			});
		});

	});
	t.is(result[0], result[1]);
});


test('jsonp without cache', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:3000/test.html');
	const result = await page.evaluate(() => {
		const rst = [];
		return new Promise(rs => {
			let i = 0;
			window.test = function (data) {
				rst[i++] = data;
				console.log(i);
				i === 2 && rs(rst);
			};
			tinyjx.jsonp({
				url: 'http://127.0.0.1:8080/jsonp?cache=0',
				callbackName: 'test'
			});
			tinyjx.jsonp({
				url: 'http://127.0.0.1:8080/jsonp?cache=0',
				callbackName: 'test'
			});
		});

	});
	t.not(result[0], result[1]);
});


test('jsonp url with beforeSend', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:3000/test.html');
	const result = await page.evaluate(() => new Promise(rs => {
		const rst = {};
		tinyjx.jsonp({
			url: 'http://127.0.0.1:8080/jsonp',
			beforeSend(url, options) {
				rst.url = url;
				rst.options = options;
			},
			success(data) {
				rst.data = data;
				rs(rst);
			}
		});
	}));
	const { url, options, data } = result;
	t.regex(url, /http:\/\/127\.0\.0\.1:8080\/jsonp/);
	t.deepEqual(data, {
		hello: 'world'
	});
	t.true(isObj(options));
});



test('jsonp url with beforeSend return false', puppeteerHelper, async (t, page) => {
	t.plan(1);
	await page.goto('http://127.0.0.1:3000/test.html');
	page.on('console', msg => {
		t.is(msg.text(), 'beforeSend');
	});
	await page.evaluate(() => {
		tinyjx.jsonp({
			url: 'http://127.0.0.1:8080/jsonp',
			beforeSend() {
				console.log('beforeSend');
				return false;
			},
			success(data) {
				console.log(data);
			}
		});
	});
	await sleep(2000);
});



test('jsonp with script load error unhandled', puppeteerHelper, async (t, page) => {
	t.plan(1);
	await page.goto('http://127.0.0.1:3000/test.html');
	page.on('pageerror', err => {
		t.regex(err.message, /Load script/);
	});
	await page.evaluate(() => {
		tinyjx.jsonp({
			url: 'http://127.0.0.1:8080/jsop',
			success(data) {
				console.log(data);
			}
		});
	});
	await sleep(2000);
});


test('jsonp with script load error handled', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:3000/test.html');
	const result = await page.evaluate(() => new Promise(rs => {
		tinyjx.jsonp({
			url: 'http://127.0.0.1:8080/jsop',
			success(data) {
				rs(data);
			},
			error(err, e) {
				rs({
					message: err.message,
					e
				});
			}
		});
	}));
	const { message, e } = result;
	t.regex(message, /Load script/);
	t.true(isObj(e));
});



test('jsonp with only complete and script load error', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:3000/test.html');
	const result = await page.evaluate(() => new Promise(rs => {
		tinyjx.jsonp({
			url: 'http://127.0.0.1:8080/jsop',
			complete(status) {
				rs(status);
			}
		});
	}));
	t.is(result, 'error');
});



test('jsonp with complete and script load error handled', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:3000/test.html');
	const result = await page.evaluate(() => new Promise(rs => {
		const rst = {};
		tinyjx.jsonp({
			url: 'http://127.0.0.1:8080/jsop',
			error(err, e) {
				rst.message = err.message;
				rst.e = e;
			},
			complete(status) {
				rst.status = status;
				rs(rst);
			}
		});
	}));
	const { message, e, status } = result;
	t.regex(message, /Load script/);
	t.true(isObj(e));
	t.is(status, 'error');
});



test('jsonp with success and error', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:3000/test.html');
	const result = await page.evaluate(() => new Promise(rs => {
		const rst = {};
		tinyjx.jsonp({
			url: 'http://127.0.0.1:8080/jsonp',
			crossorigin: 'anonymous',
			success(data) {
				rst.data = data;
			},
			error(err, e) {
				rst.message = err.message;
				rst.e = e;
				rs(rst);
			}
		});
	}));
	const { message, e, data } = result;
	t.regex(message, /Load script/);
	t.true(isObj(e));
	t.is(data, undefined);
});



test('jsonp with all callback', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:3000/test.html');
	const result = await page.evaluate(() => new Promise(rs => {
		const rst = {};
		tinyjx.jsonp({
			url: 'http://127.0.0.1:8080/jsonp',
			beforeSend(url, options) {
				rst.url = url;
				rst.options = options;
			},
			success(data) {
				rst.data = data;
			},
			error(err, e) {
				rst.err = err;
				rst.e = e;
			},
			complete(status) {
				rst.status = status;
				rs(rst);
			}
		});
	}));
	const { url, options, data, err, e, status } = result;
	t.regex(url, /http:\/\/127\.0\.0\.1:8080\/jsonp/);
	t.true(isObj(options));
	t.deepEqual(data, {
		hello: 'world'
	});
	t.falsy(err);
	t.falsy(e);
	t.is(status, 'success');
});