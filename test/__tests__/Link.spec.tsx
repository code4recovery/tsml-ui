import React from 'react';

import '@testing-library/jest-dom';

import { screen, render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { Meeting } from '../../src/types';
import Link from '../../src/components/Link';
import { SettingsContext, mergeSettings } from '../../src/helpers/settings';
import { mockState } from '../__fixtures__';

const mockMeeting: Meeting = {
  name: 'Foo',
  types: ['M'],
  slug: 'bar-baz',
  formatted_address: '123 Main St, Anytown, AK 12345, USA',
};

describe('<Link />', () => {
  it('works without flags', () => {
    const mockSettings = mergeSettings({
      flags: [],
    });

    render(
      <SettingsContext.Provider value={mockSettings}>
        <Link meeting={mockMeeting} state={undefined} setState={undefined} />
      </SettingsContext.Provider>
    );

    expect(screen.queryByText(/men/i)).toBeNull();
  });

  it('works without props', () => {
    const mockSettings = mergeSettings();
    render(
      <SettingsContext.Provider value={mockSettings}>
        <Link meeting={mockMeeting} state={undefined} setState={undefined} />
      </SettingsContext.Provider>
    );

    expect(screen.getByText(mockMeeting.name)).toBeInTheDocument();
    expect(screen.getByText(/men/i)).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('works with flags', () => {
    const mockSettings = mergeSettings({
      flags: ['M'],
    });

    render(
      <SettingsContext.Provider value={mockSettings}>
        <Link meeting={mockMeeting} state={undefined} setState={undefined} />
      </SettingsContext.Provider>
    );

    expect(screen.getByText(/men/i)).toBeInTheDocument();
  });

  it('works with setState', () => {
    const mockSetState = jest.fn();

    render(
      <MemoryRouter>
        <SettingsContext.Provider value={mergeSettings()}>
          <Link
            meeting={mockMeeting}
            state={mockState}
            setState={mockSetState}
          />
        </SettingsContext.Provider>
      </MemoryRouter>
    );

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('href', 'https://test.com/?meeting=bar-baz');
    expect(link).toHaveTextContent(/foo/i);
    expect(screen.getByText(/men/i)).toBeInTheDocument();

    fireEvent.click(link);

    /*
    expect(mockSetState).toHaveBeenCalledWith({
      ...mockState,
      input: { ...mockState.input, meeting: 'bar-baz' },
    });
    */
  });
});
