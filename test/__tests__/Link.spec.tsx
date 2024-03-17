import React from 'react';

import { screen, render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Link from '../../src/components/Link';
import { SettingsProvider, mergeSettings } from '../../src/helpers/settings';
import { Meeting } from '../../src/types';

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
      <SettingsProvider value={mockSettings}>
        <Link meeting={mockMeeting} />
      </SettingsProvider>
    );

    expect(screen.queryByText(/men/i)).toBeNull();
  });

  it('works without props', () => {
    const mockSettings = mergeSettings();
    render(
      <SettingsProvider value={mockSettings}>
        <Link meeting={mockMeeting} />
      </SettingsProvider>
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
      <SettingsProvider value={mockSettings}>
        <Link meeting={mockMeeting} />
      </SettingsProvider>
    );

    expect(screen.getByText(/men/i)).toBeInTheDocument();
  });

  it('works with setState', () => {
    render(
      <MemoryRouter>
        <SettingsProvider value={mergeSettings()}>
          <Link meeting={mockMeeting} />
        </SettingsProvider>
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
