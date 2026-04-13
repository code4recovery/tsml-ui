/// <reference types="vitest/config" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
    cssInjectedByJsPlugin(),
  ],
  publicDir: false, // Disable public folder copying to avoid conflicts
  build: {
    minify: 'terser',
    outDir: 'public',
    chunkSizeWarningLimit: 700,
    emptyOutDir: false, // Don't clear public dir (contains HTML files)
    cssCodeSplit: false,
    rolldownOptions: {
      input: 'src/app.tsx',
      output: {
        entryFileNames: 'app.js',
        codeSplitting: false, // Single file output
        format: 'iife', // Use IIFE to isolate from globals
        name: 'TsmlUI', // Name for the IIFE
      },
      checks: {
        // Removes warning that builds take long :) https://rolldown.rs/options/checks#plugintimings
        pluginTimings: false,
      },
    },
  },
  test: {
    include: ['tests/unit/**/*.spec.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./tests/unit/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.(j|t)s*'],
      exclude: ['src/(types|i18n)/*', '**/__snapshots__/*', 'src/**/index.ts'],
    },
  },
});
