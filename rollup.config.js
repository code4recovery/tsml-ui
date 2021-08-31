import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import external from "rollup-plugin-peer-deps-external";
import scss from 'rollup-plugin-scss';
import { terser } from "rollup-plugin-terser";
import { uglify } from "rollup-plugin-uglify";
import css from 'rollup-plugin-css-only';
import json from '@rollup/plugin-json';

import packageJSON from "./package.json";
const input = "./src/index.js";
const minifyExtension = pathToFile => pathToFile.replace(/\.js$/, ".min.js");
const common_cfg = {
  namedExports: {
    'node_modules/react/index.js': ['Component', 'PureComponent', 'Fragment', 'Children', 'createElement', 'useEffect', 'useRef', 'useState', 'createContext', 'useContext', 'useLayoutEffect', 'useCallback', 'useImperativeHandle', 'forwardRef', 'useMemo', 'cloneElement', 'createRef', 'memo'],
    'node_modules/prop-types/index.js': ['bool', 'object', 'func', 'string', 'checkPropTypes', 'oneOf', 'number', 'instanceOf', 'array', 'oneOfType', 'arrayOf']
  }
}

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
      commonjs(common_cfg),
      scss({ output: true }),
      css({ output: true }),
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
      commonjs(common_cfg),
      scss({ output: true }),
      css({ output: true }),
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
      commonjs(common_cfg),
      scss({ output: true }),
      css({ output: true }),
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
      commonjs(common_cfg),
      scss({ output: true }),
      css({ output: true }),
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
      commonjs(common_cfg),
      scss({ output: true }),
      css({ output: true }),
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
      commonjs(common_cfg),
      scss({ output: true }),
      css({ output: true }),
      json(),
      terser()
    ]
  }
];