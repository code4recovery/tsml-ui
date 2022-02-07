import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import * as momentTZ from 'moment-timezone';

momentTZ.tz.setDefault('America/New_York');

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
