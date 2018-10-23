import test from 'ava';
import puppeteerHelper from './_puppeteer';
import './_pock';

/* global jsonp, ajax, ajaxSync, config */

/**
 * AVA 默认不处理src下面的文件, 所以需要@babel/register
 * 对于async, 还需要@babel/polyfill, 这些都在package.json中配置
 * 另外由于tree shaking的需要, 全局的babel配置是不会将ES module
 * 语法转换成CommonJS的(modules: false), 所以需要覆盖掉全局babel配置
 */

const sleep = time => new Promise(rs => setTimeout(rs, time));
const isObj = o => Object.prototype.toString.call(o) === '[object Object]';

/********************* JSONP *********************/

test('jsonp empty args', puppeteerHelper(), async (t, page) => {
	const result = page.evaluate(() => {
		jsonp({});
	});
	await t.throwsAsync(result, /Must set a success callback or complete callback./);
});

test('jsonp without url', puppeteerHelper(), async (t, page) => {
	const result = page.evaluate(() => {
		jsonp({
			success(data) {
				console.log(data);
			}
		});
	});
	await t.throwsAsync(result, /url expected a non empty string, but received/);
});

test('jsonp only success', puppeteerHelper(), async (t, page) => {
	const result = await page.evaluate(
		() =>
			new Promise(rs => {
				jsonp({
					url: 'http://127.0.0.1:8080/jsonp',
					success(data) {
						rs(data);
					}
				});
			})
	);
	t.deepEqual(result, {
		hello: 'world'
	});
});

test('jsonp url with placeholder', puppeteerHelper(), async (t, page) => {
	const result = await page.evaluate(
		() =>
			new Promise(rs => {
				jsonp({
					url: 'http://127.0.0.1:8080/jsonp?aaa=1&callback=?&bbb=2',
					success(data) {
						rs(data);
					}
				});
			})
	);
	t.deepEqual(result, {
		hello: 'world'
	});
});

test('jsonp url with query', puppeteerHelper(), async (t, page) => {
	const result = await page.evaluate(
		() =>
			new Promise(rs => {
				jsonp({
					url: 'http://127.0.0.1:8080/jsonp?aaa=1',
					success(data) {
						rs(data);
					}
				});
			})
	);
	t.deepEqual(result, {
		hello: 'world'
	});
});

test(
	'jsonp with custom callbackName and url with placeholder',
	puppeteerHelper(),
	async (t, page) => {
		const result = await page.evaluate(
			() =>
				new Promise(rs => {
					window['测试'] = function (data) {
						rs(data);
					};
					jsonp({
						url: 'http://127.0.0.1:8080/jsonp?aaa=1&callback=?&bbb=2',
						callbackName: '测试'
					});
				})
		);
		t.deepEqual(result, {
			hello: 'world'
		});
	}
);

test('jsonp with cache', puppeteerHelper(), async (t, page) => {
	const result = await page.evaluate(() => {
		const rst = [];
		return new Promise(rs => {
			let i = 0;
			window.test = function (data) {
				rst[i++] = data;
				console.log(i);
				i === 2 && rs(rst);
			};
			jsonp({
				url: 'http://127.0.0.1:8080/jsonp?cache=0',
				cache: true,
				callbackName: 'test'
			});
			jsonp({
				url: 'http://127.0.0.1:8080/jsonp?cache=0',
				cache: true,
				callbackName: 'test'
			});
		});
	});
	t.is(result[0], result[1]);
});

test('jsonp without cache', puppeteerHelper(), async (t, page) => {
	const result = await page.evaluate(() => {
		const rst = [];
		return new Promise(rs => {
			let i = 0;
			window.test = function (data) {
				rst[i++] = data;
				console.log(i);
				i === 2 && rs(rst);
			};
			jsonp({
				url: 'http://127.0.0.1:8080/jsonp?cache=0',
				callbackName: 'test'
			});
			jsonp({
				url: 'http://127.0.0.1:8080/jsonp?cache=0',
				callbackName: 'test'
			});
		});
	});
	t.not(result[0], result[1]);
});

test('jsonp url with beforeSend', puppeteerHelper(), async (t, page) => {
	const result = await page.evaluate(
		() =>
			new Promise(rs => {
				const rst = {};
				jsonp({
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
			})
	);
	const { url, options, data } = result;
	t.regex(url, /http:\/\/127\.0\.0\.1:8080\/jsonp/);
	t.deepEqual(data, {
		hello: 'world'
	});
	t.true(isObj(options));
});

test('jsonp url with beforeSend return false', puppeteerHelper(), async (t, page) => {
	t.plan(1);
	page.on('console', msg => {
		t.is(msg.text(), 'beforeSend');
	});
	await page.evaluate(() => {
		jsonp({
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
	await sleep(3000);
});

test('jsonp with script load error unhandled', puppeteerHelper(), async (t, page) => {
	t.plan(1);
	page.on('pageerror', err => {
		t.regex(err.message, /Load script/);
	});
	await page.evaluate(() => {
		jsonp({
			url: 'http://127.0.0.1:8080/jsop',
			success(data) {
				console.log(data);
			}
		});
	});
	await sleep(3000);
});

test('jsonp with script load error handled', puppeteerHelper(), async (t, page) => {
	const result = await page.evaluate(
		() =>
			new Promise(rs => {
				jsonp({
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
			})
	);
	const { message, e } = result;
	t.regex(message, /Load script/);
	t.true(isObj(e));
});

test('jsonp with only complete and script load error', puppeteerHelper(), async (t, page) => {
	const result = await page.evaluate(
		() =>
			new Promise(rs => {
				jsonp({
					url: 'http://127.0.0.1:8080/jsop',
					complete(status) {
						rs(status);
					}
				});
			})
	);
	t.is(result, 'error');
});

test('jsonp with complete and script load error handled', puppeteerHelper(), async (t, page) => {
	const result = await page.evaluate(
		() =>
			new Promise(rs => {
				const rst = {};
				jsonp({
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
			})
	);
	const { message, e, status } = result;
	t.regex(message, /Load script/);
	t.true(isObj(e));
	t.is(status, 'error');
});

test('jsonp with success and error', puppeteerHelper(), async (t, page) => {
	const result = await page.evaluate(
		() =>
			new Promise(rs => {
				const rst = {};
				jsonp({
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
			})
	);
	const { message, e, data } = result;
	t.regex(message, /Load script/);
	t.true(isObj(e));
	t.is(data, undefined);
});

test('jsonp with all callback', puppeteerHelper(), async (t, page) => {
	const result = await page.evaluate(
		() =>
			new Promise(rs => {
				const rst = {};
				jsonp({
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
			})
	);
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

/********************* ajax *********************/
test('ajax get success', puppeteerHelper('http://127.0.0.1:8080/test.html'), async (t, page) => {
	const result = await page.evaluate(() => {
		const rst = {};
		return new Promise(rs => {
			const abortable = ajax({
				url: 'http://127.0.0.1:8080/ajax',
				method: 'get',
				success(data, xhr, e) {
					rst.data = data;
					rst.id = xhr._id;
					rst.active = xhr._active;
					rst.e = e;
					rs(rst);
				}
			});
			rst.abortType = typeof abortable.abort;
		});
	});
	const { data, id, active, e, abortType } = result;
	t.deepEqual(data, {
		data: 'get'
	});
	t.true(typeof id === 'number');
	t.true(typeof active === 'boolean');
	t.true(isObj(e));
	t.is(abortType, 'function');
});

test('ajax head success', puppeteerHelper('http://127.0.0.1:8080/test.html'), async (t, page) => {
	const result = await page.evaluate(() => {
		const rst = {};
		return new Promise(rs => {
			const abortable = ajax({
				url: 'http://127.0.0.1:8080/ajax',
				method: 'head',
				success(data, xhr, e) {
					rst.data = data;
					rst.id = xhr._id;
					rst.active = xhr._active;
					rst.e = e;
					rs(rst);
				}
			});
			rst.abortType = typeof abortable.abort;
		});
	});
	const { data, id, active, e, abortType } = result;
	t.is(data, null);
	t.true(typeof id === 'number');
	t.true(typeof active === 'boolean');
	t.true(isObj(e));
	t.is(abortType, 'function');
});

test('ajax post success', puppeteerHelper('http://127.0.0.1:8080/test.html'), async (t, page) => {
	const result = await page.evaluate(() => {
		const rst = {};
		return new Promise(rs => {
			const abortable = ajax({
				url: 'http://127.0.0.1:8080/ajax',
				method: 'post',
				success(data, xhr, e) {
					rst.data = data;
					rst.id = xhr._id;
					rst.active = xhr._active;
					rst.e = e;
					rs(rst);
				}
			});
			rst.abortType = typeof abortable.abort;
		});
	});
	const { data, id, active, e, abortType } = result;
	t.deepEqual(data, {
		data: 'post'
	});
	t.true(typeof id === 'number');
	t.true(typeof active === 'boolean');
	t.true(isObj(e));
	t.is(abortType, 'function');
});

test('ajax put success', puppeteerHelper('http://127.0.0.1:8080/test.html'), async (t, page) => {
	const result = await page.evaluate(() => {
		const rst = {};
		return new Promise(rs => {
			const abortable = ajax({
				url: 'http://127.0.0.1:8080/ajax',
				method: 'put',
				success(data, xhr, e) {
					rst.data = data;
					rst.id = xhr._id;
					rst.active = xhr._active;
					rst.e = e;
					rs(rst);
				}
			});
			rst.abortType = typeof abortable.abort;
		});
	});
	const { data, id, active, e, abortType } = result;
	t.deepEqual(data, {
		data: 'put'
	});
	t.true(typeof id === 'number');
	t.true(typeof active === 'boolean');
	t.true(isObj(e));
	t.is(abortType, 'function');
});

test('ajax patch success', puppeteerHelper('http://127.0.0.1:8080/test.html'), async (t, page) => {
	const result = await page.evaluate(() => {
		const rst = {};
		return new Promise(rs => {
			const abortable = ajax({
				url: 'http://127.0.0.1:8080/ajax',
				method: 'patch',
				success(data, xhr, e) {
					rst.data = data;
					rst.id = xhr._id;
					rst.active = xhr._active;
					rst.e = e;
					rs(rst);
				}
			});
			rst.abortType = typeof abortable.abort;
		});
	});
	const { data, id, active, e, abortType } = result;
	t.deepEqual(data, {
		data: 'patch'
	});
	t.true(typeof id === 'number');
	t.true(typeof active === 'boolean');
	t.true(isObj(e));
	t.is(abortType, 'function');
});

test('ajax delete success', puppeteerHelper('http://127.0.0.1:8080/test.html'), async (t, page) => {
	const result = await page.evaluate(() => {
		const rst = {};
		return new Promise(rs => {
			const abortable = ajax({
				url: 'http://127.0.0.1:8080/ajax',
				method: 'delete',
				success(data, xhr, e) {
					rst.data = data;
					rst.id = xhr._id;
					rst.active = xhr._active;
					rst.e = e;
					rs(rst);
				}
			});
			rst.abortType = typeof abortable.abort;
		});
	});
	const { data, id, active, e, abortType } = result;
	t.deepEqual(data, {
		data: 'delete'
	});
	t.true(typeof id === 'number');
	t.true(typeof active === 'boolean');
	t.true(isObj(e));
	t.is(abortType, 'function');
});

test('ajax options success', puppeteerHelper('http://127.0.0.1:8080/test.html'), async (t, page) => {
	const result = await page.evaluate(() => {
		const rst = {};
		return new Promise(rs => {
			const abortable = ajax({
				url: 'http://127.0.0.1:8080/ajax',
				method: 'options',
				success(data, xhr, e) {
					rst.data = data;
					rst.id = xhr._id;
					rst.active = xhr._active;
					rst.e = e;
					rs(rst);
				}
			});
			rst.abortType = typeof abortable.abort;
		});
	});
	const { data, id, active, e, abortType } = result;
	t.deepEqual(data, {
		data: 'options'
	});
	t.true(typeof id === 'number');
	t.true(typeof active === 'boolean');
	t.true(isObj(e));
	t.is(abortType, 'function');
});

test('ajax invalid http method', puppeteerHelper('http://127.0.0.1:8080/test.html'), async (t, page) => {
	const result = page.evaluate(
		() =>
			new Promise(rs => {
				ajax({
					url: 'http://127.0.0.1:8080/ajax',
					method: 'test'
				});
			})
	);
	await t.throwsAsync(result);
});

test('ajax invalid contentType', puppeteerHelper('http://127.0.0.1:8080/test.html'), async (t, page) => {
	const result = page.evaluate(
		() =>
			new Promise(rs => {
				ajax({
					url: 'http://127.0.0.1:8080/ajax',
					contentType: 123
				});
			})
	);
	await t.throwsAsync(result);
});

test('ajax predefined contentType', puppeteerHelper('http://127.0.0.1:8080/test.html'), async (t, page) => {
	const result = page.evaluate(() => {
		const rst = {};
		return new Promise(rs => {
			ajax({
				url: 'http://127.0.0.1:8080/ajax',
				method: 'post',
				contentType: 'json',
				data: {
					hello: 'world'
				},
				serialize({ data, method, contentType, url, cache }) {
					rst.data = data;
					rst.method = method;
					rst.contentType = contentType;
					rst.url = url;
					rst.cache = cache;
					rs(rst);
				}
			});
			const { data, method, contentType, url, cache } = result;
			t.deepEqual(data, {
				hello: 'world'
			});
			t.is(method, 'POST');
			t.is(contentType, 'application/json');
			t.is(url, 'http://127.0.0.1:8080/ajax');
			t.true(cache);
		});
	});
	await t.throwsAsync(result);
});

test('ajax with error unhandled', puppeteerHelper('http://127.0.0.1:8080/test.html'), async (t, page) => {
	page.on('pageerror', err => {
		t.regex(err.message, /Remote server error/);
	});
	await page.evaluate(() => {
		ajax({
			url: 'http://127.0.0.1:8080/ajaxerr'
		});
	});
	await sleep(3000);
});

test('ajax with error handled', puppeteerHelper('http://127.0.0.1:8080/test.html'), async (t, page) => {
	const result = await page.evaluate(() => {
		const rst = {};
		return new Promise(rs => {
			ajax({
				url: 'http://127.0.0.1:8080/ajaxerr',
				error(err, xhr, e) {
					rst.message = err.message;
					rst.xhr = xhr;
					rst.e = e;
					rs(rst);
				}
			});
		});
	});
	const { message, xhr, e } = result;
	t.regex(message, /Remote server error/);
	t.true(isObj(xhr));
	t.true(isObj(e));
});

test('ajax with complete handled error', puppeteerHelper('http://127.0.0.1:8080/test.html'), async (t, page) => {
	const result = await page.evaluate(() => {
		const rst = {};
		return new Promise(rs => {
			ajax({
				url: 'http://127.0.0.1:8080/ajaxerr',
				complete(xhr, status) {
					rst.xhr = xhr;
					rst.status = status;
					rs(rst);
				}
			});
		});
	});
	const { xhr, status } = result;
	t.true(isObj(xhr));
	t.is(status, 'error');
});
