import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import builtins from 'builtin-modules';
import { terser } from 'rollup-plugin-terser';

const plugins = [
  typescript(),
  resolve({ preferBuiltins: true }),
  commonjs({
    namedExports: {
      'aws-sdk/clients/dynamodb': ['DocumentClient'],
    },
  }),
  json(),
  terser(),
];
const format = 'cjs';
const external = builtins;

export default [
  {
    input: 'src/color.ts',
    output: {
      file: 'target/lambda/color.js',
      format,
    },
    plugins,
    external,
  },
  {
    input: 'src/refresh.ts',
    output: {
      file: 'target/lambda/refresh.js',
      format,
    },
    plugins,
    external,
  },
];
