import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import scss from 'rollup-plugin-scss';
import css from 'rollup-plugin-css-only';


export default // LiveReload
{
  input: "src/app.js",
  output: {
    file: "dist/bundle.js",
    format: "esm",
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
      exclude: "node_modules/**"
    }),
    commonjs(),
    json(),
    scss({ output: true }),
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