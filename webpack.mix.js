let mix = require('laravel-mix');

mix
    .sass('src/style.scss', 'public')
    .options({ processCssUrls: false })
    .react('src/app.jsx', 'public');