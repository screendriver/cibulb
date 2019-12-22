import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

const plugins = [
  typescript(),
  resolve({ preferBuiltins: true }),
  commonjs(),
  json(),
  terser(),
];
const format = 'cjs';

export default [
  {
    input: 'src/color.ts',
    output: {
      file: 'target/lambda/color.js',
      format,
    },
    plugins,
  },
  {
    input: 'src/refresh.ts',
    output: {
      file: 'target/lambda/refresh.js',
      format,
    },
    plugins,
  },
];
