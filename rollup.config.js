import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import sass from 'rollup-plugin-sass';
import { uglify } from "rollup-plugin-uglify";
import css from 'rollup-plugin-css-only';
import json from '@rollup/plugin-json';

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
      babel({
        exclude: "node_modules/**"
      }),
      external(),
      resolve(),
      commonjs({
        namedExports: {
          'node_modules/react/index.js': ['Component', 'PureComponent', 'Fragment', 'Children', 'createElement', 'useEffect', 'useRef', 'useState', 'createContext', 'useContext', 'useLayoutEffect', 'useCallback', 'useImperativeHandle', 'forwardRef', 'useMemo', 'cloneElement', 'createRef']
        }
      }),
      sass({ output: true }),
      css({ output: 'bundle.css' }),
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
      babel({
        exclude: "node_modules/**"
      }),
      external(),
      resolve(),
      commonjs({
        namedExports: {
          'node_modules/react/index.js': ['Component', 'PureComponent', 'Fragment', 'Children', 'createElement', 'useEffect', 'useRef', 'useState', 'createContext', 'useContext', 'useLayoutEffect', 'useCallback', 'useImperativeHandle', 'forwardRef', 'useMemo', 'cloneElement', 'createRef']
        }
      }),
      sass({ output: true }),
      css({ output: 'bundle.css' }),
      json(),
      uglify()
    ]
  }
];