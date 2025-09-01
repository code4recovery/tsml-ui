import { act, render } from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';
import TsmlUI from '../../src/components/TsmlUI';
import { json } from '../__fixtures__/json.ts';

describe('TsmlUI', () => {
  // mock fetch
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: {
          get: () => 'application/json',
        },
        json: () => Promise.resolve(json),
      })
    );
  });

  it('renders correctly', async () => {
    const { container, getByText } = await act(() =>
      render(
        <MemoryRouter>
          <TsmlUI src="#" />
        </MemoryRouter>
      )
    );
    expect(container).toBeTruthy();

    expect(getByText(json[0].name)).toBeInTheDocument();
  });
});
