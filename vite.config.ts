import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import * as fs from 'fs';
import * as path from 'path';

// Custom plugin to inline CSS into JS
function inlineCSSPlugin(): Plugin {
  return {
    name: 'inline-css',
    closeBundle() {
      const outDir = resolve(__dirname, 'public');
      const jsFile = path.join(outDir, 'app.js');
      const cssFile = path.join(outDir, 'style.css');

      // Check if both files exist
      if (fs.existsSync(jsFile) && fs.existsSync(cssFile)) {
        const css = fs.readFileSync(cssFile, 'utf-8');
        const js = fs.readFileSync(jsFile, 'utf-8');

        // Create code to inject CSS
        const cssInjectionCode = `
(function() {
  var style = document.createElement('style');
  style.textContent = ${JSON.stringify(css)};
  document.head.appendChild(style);
})();
`;

        // Prepend CSS injection to JS
        fs.writeFileSync(jsFile, cssInjectionCode + js);

        // Remove the CSS file
        fs.unlinkSync(cssFile);

        console.log('✓ Inlined CSS into app.js');
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    inlineCSSPlugin(),
  ],
  publicDir: false, // Don't copy public dir files during build
  build: {
    outDir: 'public',
    emptyOutDir: false, // Don't empty public dir (preserve other files)
    cssCodeSplit: false, // Bundle all CSS into a single file
    rollupOptions: {
      input: resolve(__dirname, 'src/app.tsx'),
      output: {
        entryFileNames: 'app.js',
        chunkFileNames: 'app.js',
        assetFileNames: '[name][extname]',
        inlineDynamicImports: true, // Inline all dynamic imports
        manualChunks: undefined, // Single bundle output
      },
    },
    sourcemap: false, // Disable source maps for production
  },
  server: {
    open: '/index.html',
  },
});
