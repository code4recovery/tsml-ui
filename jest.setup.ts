import '@testing-library/jest-dom/extend-expect';
import React from 'react';

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
