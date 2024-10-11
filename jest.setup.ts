import '@testing-library/jest-dom';
import React from 'react';

global.React = React;

const savedLocation = window.location;
const savedHistory = window.history;

beforeEach(() => {
  Object.defineProperties(window, {
    ga: {
      value: jest.fn(),
      writable: true,
    },
    gtag: {
      value: jest.fn(),
      writable: true,
    },
    history: {
      value: {
        back: jest.fn(),
        forward: jest.fn(),
        go: jest.fn(),
        pushState: jest.fn(),
        replaceState: jest.fn(),
      },
      writable: true,
    },
    location: {
      value: new URL('https://test.com'),
      writable: true,
    },
  });
});

afterEach(() => {
  window.location = savedLocation;
  window.history = savedHistory;
});
