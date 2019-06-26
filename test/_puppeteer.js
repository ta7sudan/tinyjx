import test from 'ava';
import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let browser = null;
const sourceCode = readFileSync(resolve(__dirname, '../dist/tinyjx.esm.js'), 'utf8').replace(/export/g, '');

// 其实这里不应该用before和after这样的框架API的,
// 因为AVA的测试代码引入模块不知道为什么, 会导致多次
// 引入模块多次执行, 而不是缓存, 这样的话browser还是
// 会实例化多次, 目前没看到有什么好的解决方案
// 只能所有测试代码写在一个文件里了
test.before(async () => {
	browser = await puppeteer.launch();
	// browser = await puppeteer.launch({
	// 	headless: false
	// });
});

test.after(async () => {
	if (browser) {
		await browser.close();
	}
});


export default function startBrowser(url = 'http://127.0.0.1:3000/test.html') {
	return async function (t, run) {
		const page = await browser.newPage();
		await page.goto(url);
		// 令人智熄的操作...
		page.addScriptTag({
			content: 'DEBUG = true;'
		});
		page.addScriptTag({
			content: sourceCode
		});
		try {
			await run(t, page, sourceCode, browser);
		} finally {
			// 页面要在这里关闭, 不知道怎么把page注入到afterEach的作用域中去
			await page.close();
			// 但是不要在这里关闭浏览器, 多个测试可能多次关闭浏览器导致异常, 要么又加锁
			// 但是我个人建议在after里关闭, 省心
		}
	};
}
// 现在问题是解决了, 但是这个路子不怎么优雅, 那么问题来了
// 1. 怎么在AVA中优雅地做到只实例化一个browser并且不需要通过全局变量?
// 2. 现在虽然可以把page注入到测试代码的作用于中, 但是有没有什么办法
// 把这些变量注入到其他生命周期的作用域中? 比如afterEach, 这样就可以在
// afterEach中关闭页面了
// 3. 个人觉得有before/after这些hook也足够了, 但是这些hook好像没办法
// 向之后的hook中传递参数, 如果可以的话, 那这事情做起来就优雅很多,
// 就可以在before中实例化browser, 然后传递给beforeEach, 在beforeEach中
// 实例化page, 传递给测试代码, 在afterEach中获取到page, 然后关闭
// 4. 另外, AVA这个helper具体要怎么写似乎没看到有文档