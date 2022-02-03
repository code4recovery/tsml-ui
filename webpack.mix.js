let mix = require('laravel-mix');

mix
  .sass('src/style.scss', 'public')
  .options({ processCssUrls: false })
  .ts('src/app.tsx', 'public')
  .react();
