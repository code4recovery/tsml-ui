/// <reference types="vitest/config" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

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
    minify: 'terser',
    outDir: 'public',
    chunkSizeWarningLimit: 600,
    emptyOutDir: false, // Don't clear public dir (contains HTML files)
    cssCodeSplit: false,
    rollupOptions: {
      input: 'src/app.tsx',
      output: {
        entryFileNames: 'app.js',
        manualChunks: undefined,    // Single file output
        inlineDynamicImports: true, // Inline all imports
        format: 'iife',             // Use IIFE to isolate from globals
        name: 'TsmlUI',             // Name for the IIFE
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.(j|t)s*'],
      exclude: ['src/(types|i18n)/*', '**/__snapshots__/*', 'src/**/index.ts'],
    },
  },
});
