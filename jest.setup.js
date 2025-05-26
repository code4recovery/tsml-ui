import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { TextEncoder, TextDecoder } from 'node:util';

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}

// window.matchMedia doesn't exist in test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.React = React;

const savedLocation = window.location;
const savedHistory = window.history;

beforeEach(() => {
  delete window.location;
  delete window.history;

  window.history = {
    pushState: jest.fn(),
  };

  window.location = new URL('https://test.com');
  window.location.reload = jest.fn();
});

afterEach(() => {
  window.location = savedLocation;
  window.history = savedHistory;
});
