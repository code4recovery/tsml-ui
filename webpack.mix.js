let mix = require('laravel-mix');

mix
  .sass('src/style.scss', 'public')
  .options({ processCssUrls: false })
  .js('src/app.jsx', 'public')
  .react();
