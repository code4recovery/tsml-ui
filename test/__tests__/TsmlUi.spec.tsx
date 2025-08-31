import { act, render } from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';
import TsmlUI from '../../src/components/TsmlUI';

describe('TsmlUI', () => {
  // mock fetch
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            {
              slug: 'test-title-1',
              name: 'Test Name 1',
              time: '08:00',
              day: 0,
              types: ['O', 'M', 'X'],
            },
            {
              slug: 'test-title-2',
              name: 'Test Name 2',
              time: '09:00',
              day: 1,
              types: ['O', 'M', 'X'],
            },
          ]),
      })
    );
  });

  it('renders correctly', async () => {
    const { container } = await act(() =>
      render(
        <MemoryRouter>
          <TsmlUI src=" " />
        </MemoryRouter>
      )
    );
    expect(container).toBeTruthy();
  });
});
