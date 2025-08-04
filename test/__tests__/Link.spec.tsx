import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Link from '../../src/components/Link';
import { SettingsProvider } from '../../src/hooks';
import { Meeting } from '../../src/types';

const mockMeeting: Meeting = {
  name: 'Foo',
  types: ['M'],
  slug: 'bar-baz',
  formatted_address: '123 Main St, Anytown, AK 12345, USA',
};

describe('<Link />', () => {
  it('works without flags', () => {
    const mockSettings = {
      flags: [],
    };

    render(
      <SettingsProvider userSettings={mockSettings}>
        <Link meeting={mockMeeting} />
      </SettingsProvider>
    );

    expect(screen.queryByText(/men/i)).toBeNull();
  });

  it('works without props', () => {
    const mockSettings = {};
    render(
      <SettingsProvider userSettings={mockSettings}>
        <Link meeting={mockMeeting} />
      </SettingsProvider>
    );

    expect(screen.getByText(mockMeeting.name)).toBeInTheDocument();
    expect(screen.getByText(/men/i)).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('works with flags', () => {
    const mockSettings = {
      flags: ['M'],
    };

    render(
      <SettingsProvider userSettings={mockSettings}>
        <Link meeting={mockMeeting} />
      </SettingsProvider>
    );

    expect(screen.getByText(/men/i)).toBeInTheDocument();
  });

  it('works with setState', () => {
    const mockSetState = jest.fn();

    render(
      <MemoryRouter>
        <SettingsProvider userSettings={{}}>
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
