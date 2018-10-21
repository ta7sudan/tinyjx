import babel from 'rollup-plugin-babel';
import { name } from './package.json';

export default [
	{
		input: 'src/index.js',
		plugins: [
			babel({
				exclude: 'node_modules/**'
			})
		],
		treeshake: {
			propertyReadSideEffects: false
		},
		output:
		{
			name,
			file: 'example/scripts/tinyjx.umd.js',
			format: 'umd',
			sourcemap: true,
			sourcemapPathTransform: () => 'tinyjx.js'
		}
	}
];
