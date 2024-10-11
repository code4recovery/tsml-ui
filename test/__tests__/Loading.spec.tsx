import React from 'react';

import Loading from '../../src/components/Loading';

import { render } from '@testing-library/react';

test('<Loading />', () => {
  const loading = render(<Loading />);
  expect(loading).toMatchSnapshot();
});
