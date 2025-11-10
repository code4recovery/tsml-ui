import '@testing-library/jest-dom/vitest';
import React from 'react';
import { beforeEach, afterEach, vi } from 'vitest';
import { TextEncoder, TextDecoder } from 'node:util';

// Silence jsdom navigation errors
// These occur when tests render links with href/target attributes
// jsdom doesn't support navigation but the errors are harmless in tests
const originalStderr = process.stderr.write;
process.stderr.write = function(chunk: any, encoding?: any, callback?: any): boolean {
  const message = chunk.toString();
  if (message.includes('Not implemented: navigation')) {
    return true;
  }
  return originalStderr.apply(process.stderr, [chunk, encoding, callback] as any);
};

if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder;
}

if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder;
}

// window.matchMedia doesn't exist in test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

globalThis.React = React;

const savedLocation = window.location;
const savedHistory = window.history;

beforeEach(() => {
  delete window.location;
  delete window.history;

  window.history = {
    pushState: vi.fn(),
  };

  window.location = new URL('https://test.com');
  window.location.reload = vi.fn();
});

afterEach(() => {
  window.location = savedLocation;
  window.history = savedHistory;
});
