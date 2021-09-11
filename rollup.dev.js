import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import scss from 'rollup-plugin-scss';
import css from 'rollup-plugin-css-only';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

import packageJSON from "./package.json";
const input = "./src/index.js";
const minifyExtension = pathToFile => pathToFile.replace(/\.js$/, ".min.js");
const common_cfg = {
  namedExports: {
    'node_modules/react/index.js': ['Component', 'PureComponent', 'Fragment', 'Children', 'createElement', 'useEffect', 'useRef', 'useState', 'createContext', 'useContext', 'useLayoutEffect', 'useCallback', 'useImperativeHandle', 'forwardRef', 'useMemo', 'cloneElement', 'createRef', 'memo'],
    'node_modules/prop-types/index.js': ['bool', 'object', 'func', 'string', 'checkPropTypes', 'oneOf', 'number', 'instanceOf', 'array', 'oneOfType', 'arrayOf']
  }
}

export default // LiveReload
{
  input: "src/app.js",
  output: {
    file: "dist/bundle.js",
    format: "iife",
    sourcemap: true
  },
  plugins: [
    resolve({
      extensions: [".js"],
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify( 'development' )
    }),
    babel({
      presets: ["@babel/preset-react"],
    }),
    webWorkerLoader(),
    commonjs(),
    json(),
    scss({ output: true }),
    css({ output: true }),
    serve({
      open: true,
      verbose: true,
      contentBase: ["", "public"],
      host: "0.0.0.0",
      port: 3000,
    }),
    livereload({ watch: "dist" }),
  ]
};