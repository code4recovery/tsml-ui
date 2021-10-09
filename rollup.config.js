import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import scss from 'rollup-plugin-scss';
import { terser } from "rollup-plugin-terser";
import { uglify } from "rollup-plugin-uglify";
import json from '@rollup/plugin-json';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

import packageJSON from "./package.json";
const input = "./src/index.js";
const minifyExtension = pathToFile => pathToFile.replace(/\.js$/, ".min.js");

export default [
  // CommonJS
  {
    input,
    output: {
      file: packageJSON.main,
      format: "cjs"
    },
    plugins: [
      external(),
      resolve(),
      babel({
        exclude: "node_modules/**"
      }),
      commonjs(),
      scss({ output: true }),
      json()
    ]
  },
  {
    input,
    output: {
      file: minifyExtension(packageJSON.main),
      format: "cjs"
    },
    plugins: [
      external(),
      resolve(),
      babel({
        exclude: "node_modules/**"
      }),
      commonjs(),
      scss({ output: true }),
      json(),
      uglify()
    ]
  },
  {
    input,
    output: {
      file: packageJSON.browser,
      format: "umd",
      name: "tsmlUI",
      globals: {
        react: "React",
      }
    },
    plugins: [
      external(),
      resolve(),
      babel({
        exclude: "node_modules/**"
      }),
      commonjs(),
      scss({ output: true }),
      json()
    ]
  },
  {
    input,
    output: {
      file: minifyExtension(packageJSON.browser),
      format: "umd",
      name: "tsmlUI",
      globals: {
        react: "React",
      }
    },
    plugins: [
      external(),
      resolve(),
      babel({
        exclude: "node_modules/**"
      }),
      commonjs(),
      scss({ output: true }),
      json(),
      terser()
    ]
  },
  {
    input,
    output: {
      file: packageJSON.module,
      format: "es",
      exports: "named"
    },
    plugins: [
      external(),
      resolve(),
      babel({
        exclude: "node_modules/**"
      }),
      commonjs(),
      scss({ output: true }),
      json(),
    ]
  },
  {
    input,
    output: {
      file: minifyExtension(packageJSON.module),
      format: "es",
      exports: "named"
    },
    plugins: [
      resolve(),
      babel({
        exclude: "node_modules/**"
      }),
      external(),
      commonjs(),
      scss({ output: true }),
      json(),
      terser()
    ]
  }
];