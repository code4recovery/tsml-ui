import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin(), viteCommonjs()],
  publicDir: 'assets',
  resolve: {
    alias: {
      '~bootstrap': resolve(__dirname, 'node_modules/bootstrap'),
    },
  },
  build: {
    outDir: 'public',
    target: 'es2015',
    minify: 'esbuild',
    assetsDir: '',
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'tests/aasanjose.html'),
      },
      output: {
        entryFileNames: '[name].js',
        manualChunks: undefined,
      },
    },
  },
});
