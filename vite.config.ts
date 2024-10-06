import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'example.html'),
      },
      output: {
        entryFileNames: 'app.js',
        manualChunks: undefined,
      },
    },
  },
  plugins: [cssInjectedByJsPlugin(), react()],
});
