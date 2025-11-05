// vite.config.js
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    cssInjectedByJsPlugin(),
  ],
  publicDir: false, // Disable public folder copying to avoid conflicts
  build: {
    outDir: 'public',
    chunkSizeWarningLimit: 600,
    emptyOutDir: false, // Don't clear public dir (contains HTML files)
    cssCodeSplit: false,
    rollupOptions: {
      input: 'src/app.tsx',
      output: {
        entryFileNames: 'app.js',
        chunkFileNames: 'app.js',
        assetFileNames: 'app.[ext]',
        manualChunks: undefined, // Single file output
        inlineDynamicImports: true, // Inline all imports
      },
    },
  },
});
