import commonjs from 'rollup-plugin-commonjs';
// import purgeCss from '@fullhuman/postcss-purgecss';
import livereload from 'rollup-plugin-livereload';
import postcss from 'rollup-plugin-postcss';
import resolve from 'rollup-plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import {terser} from 'rollup-plugin-terser';
import json from 'rollup-plugin-json';
import rootImport from 'rollup-plugin-root-import';
import typescript from "@rollup/plugin-typescript";

const svelteOptions = require("./svelte.config.js");

const production = !process.env.ROLLUP_WATCH;
export default {
   input: 'src/main.js',
   output: {
      format: 'iife',
      sourcemap: true,
      name: 'app',
      file: 'dist/main.js',
   },
   plugins: [
      rootImport({
         // Will first look in `client/src/*` and then `common/src/*`.
         root: `${__dirname}/src`,

         // If we don't find the file verbatim, try adding these extensions
         extensions: [".js", ".svelte", ".ts"]
      }),
      json(),
      svelte({
        dev: !production,
        ...svelteOptions,
      }),
      resolve(),
      commonjs(),
      typescript(),
      postcss({
         extract: true,
      }),
      // !production && livereload('dist'),
      production && terser(),
   ],
   // watch: {
   //    clearScreen: false,
   // },
};
