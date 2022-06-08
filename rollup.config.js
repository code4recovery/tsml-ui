import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import scss from 'rollup-plugin-scss';
import { terser } from "rollup-plugin-terser";
import json from '@rollup/plugin-json';
import packageJSON from "./package.json";
const input = "./src/index.js";
const minifyExtension = pathToFile => pathToFile.replace(/\.js$/, ".min.js");

export default [
  {
    input,
    output: {
      dir: minifyExtension(packageJSON.module),
      format: "esm",
      globals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
      }
    },
    external: ['react', 'react-dom'],
    plugins: [
      external(),
      resolve(),
      commonjs({
        exclude: [
          "src/**"
        ]
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: [
          "node_modules/**",
          "node_modules/mapbox-gl/dist/mapbox-gl.js"
        ],
      }),
      scss({ output: 'lib/styles.css' }),
      json(),
      terser()
    ]
  }
];