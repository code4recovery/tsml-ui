import { render } from '@testing-library/react';
import { expect, it } from 'vitest';

import Loading from '../../src/components/Loading';

it('<Loading />', () => {
  const { container } = render(<Loading />);
  expect(container.firstChild).toBeTruthy();
  expect(container.querySelector('div > div > div')).toBeTruthy();
});
