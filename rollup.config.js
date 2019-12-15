import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const plugins = [
  typescript(),
  resolve({ preferBuiltins: true }),
  commonjs(),
  terser(),
];
const format = 'cjs';

export default [
  {
    input: 'src/color.ts',
    output: {
      file: 'target/color-bundle.js',
      format,
    },
    plugins,
  },
  {
    input: 'src/refresh.ts',
    output: {
      file: 'target/refresh-bundle.js',
      format,
    },
    plugins,
  },
];
