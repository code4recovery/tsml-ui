import React from 'react';

import '@testing-library/jest-dom';

import Loading from '../../src/components/Loading';

import { render, screen } from '@testing-library/react';

test('<Loading />', () => {
  render(<Loading />);
  expect(screen.getByRole('progressbar', { busy: true })).toBeInTheDocument();
});
