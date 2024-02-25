let mix = require('laravel-mix');
const webpack = require('webpack');

mix.options({publicPath: 'public/'});
// keep 1 unified app.js output file
mix.webpackConfig({
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
});

mix.ts('src/app.tsx', 'public').react();
