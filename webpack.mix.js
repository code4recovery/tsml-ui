let mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.react('assets/react.jsx', 'assets/js')
	.scripts([
		'node_modules/jquery/dist/jquery.slim.js',
		'node_modules/bootstrap/dist/js/bootstrap.bundle.js',
	], 'assets/js/app.js')
   .sass('assets/app.scss', 'assets/css')
   .options({
      processCssUrls: false
   });
