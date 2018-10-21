import test from 'ava';
import pock from 'pock/src/server';
import { resolve } from 'path';
import { safeLoad } from 'js-yaml';
import { readFileSync } from 'fs';

const pockrc = resolve(__dirname, '../.pockrc.yml');
let server0 = null, server1 = null;

test.before(async () => {
	const options0 = safeLoad(readFileSync(pockrc, 'utf8'));
	const options1 = {
		static: {
			root: resolve(__dirname, '../example')
		}
	};
	server0 = await pock(options0, resolve(__dirname, '..'));
	server1 = await pock(options1, resolve(__dirname, '..'));
});

test.after(async () => {
	server0.close();
	server1.close();
});

