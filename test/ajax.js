/* eslint-disable */
import test from 'ava';
import puppeteerHelper from './_puppeteer';
import './_pock';

/* global tinyjx */

const sleep = time => new Promise(rs => setTimeout(rs, time));
const isObj = o => Object.prototype.toString.call(o) === '[object Object]';

test('ajax get success', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:8080/test.html');
	const result = await page.evaluate(() => {
		const rst = {};
		return new Promise(rs => {
			const abortable = tinyjx.ajax({
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
	const {data, id, active, e, abortType} = result;
	t.deepEqual(data, {
		data: 'get'
	});
	t.true(typeof id === 'number');
	t.true(typeof active === 'boolean');
	t.true(isObj(e));
	t.is(abortType, 'function');
});

test('ajax head success', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:8080/test.html');
	const result = await page.evaluate(() => {
		const rst = {};
		return new Promise(rs => {
			const abortable = tinyjx.ajax({
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
	const {data, id, active, e, abortType} = result;
	t.is(data, null);
	t.true(typeof id === 'number');
	t.true(typeof active === 'boolean');
	t.true(isObj(e));
	t.is(abortType, 'function');
});

test('ajax post success', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:8080/test.html');
	const result = await page.evaluate(() => {
		const rst = {};
		return new Promise(rs => {
			const abortable = tinyjx.ajax({
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
	const {data, id, active, e, abortType} = result;
	t.deepEqual(data, {
		data: 'post'
	});
	t.true(typeof id === 'number');
	t.true(typeof active === 'boolean');
	t.true(isObj(e));
	t.is(abortType, 'function');
});

test('ajax put success', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:8080/test.html');
	const result = await page.evaluate(() => {
		const rst = {};
		return new Promise(rs => {
			const abortable = tinyjx.ajax({
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
	const {data, id, active, e, abortType} = result;
	t.deepEqual(data, {
		data: 'put'
	});
	t.true(typeof id === 'number');
	t.true(typeof active === 'boolean');
	t.true(isObj(e));
	t.is(abortType, 'function');
});

test('ajax patch success', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:8080/test.html');
	const result = await page.evaluate(() => {
		const rst = {};
		return new Promise(rs => {
			const abortable = tinyjx.ajax({
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
	const {data, id, active, e, abortType} = result;
	t.deepEqual(data, {
		data: 'patch'
	});
	t.true(typeof id === 'number');
	t.true(typeof active === 'boolean');
	t.true(isObj(e));
	t.is(abortType, 'function');
});

test('ajax delete success', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:8080/test.html');
	const result = await page.evaluate(() => {
		const rst = {};
		return new Promise(rs => {
			const abortable = tinyjx.ajax({
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
	const {data, id, active, e, abortType} = result;
	t.deepEqual(data, {
		data: 'delete'
	});
	t.true(typeof id === 'number');
	t.true(typeof active === 'boolean');
	t.true(isObj(e));
	t.is(abortType, 'function');
});

test('ajax options success', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:8080/test.html');
	const result = await page.evaluate(() => {
		const rst = {};
		return new Promise(rs => {
			const abortable = tinyjx.ajax({
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
	const {data, id, active, e, abortType} = result;
	t.deepEqual(data, {
		data: 'options'
	});
	t.true(typeof id === 'number');
	t.true(typeof active === 'boolean');
	t.true(isObj(e));
	t.is(abortType, 'function');
});


test('ajax invalid http method', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:8080/test.html');
	const result = page.evaluate(() => {
		return new Promise(rs => {
			tinyjx.ajax({
				url: 'http://127.0.0.1:8080/ajax',
				method: 'test'
			});
		});
	});
	await t.throwsAsync(result);
});


test('ajax invalid contentType', puppeteerHelper, async (t, page) => {
	await page.goto('http://127.0.0.1:8080/test.html');
	const result = page.evaluate(() => {
		return new Promise(rs => {
			tinyjx.ajax({
				url: 'http://127.0.0.1:8080/ajax',
				contentType: 123
			});
		});
	});
	await t.throwsAsync(result);
});