import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import { Meeting } from '../../types';
import Link from '../Link';
import { settings } from '../../helpers/settings';
import { mockState } from '../__fixtures__';

jest.mock('../../helpers/settings');

let mockSettings = jest.mocked(settings);

const mockMeeting: Meeting = {
  name: 'Foo',
  types: ['M'],
  slug: 'bar-baz',
} as Meeting;

describe('<Link />', () => {
  it('works without props', () => {
    const { container } = render(
      <Link meeting={mockMeeting} state={undefined} setState={undefined} />
    );

    expect(container.firstChild?.nodeValue).toBe('Foo');
  });

  it('works without flags', () => {
    mockSettings.flags = undefined;

    const { container } = render(
      <Link meeting={mockMeeting} state={undefined} setState={undefined} />
    );

    expect(container.firstChild?.nodeValue).toBe('Foo');
  });

  it('works with flags', () => {
    mockSettings.flags = ['M'];

    render(
      <Link meeting={mockMeeting} state={undefined} setState={undefined} />
    );

    expect(screen.getByText(/men/i)).toBeInTheDocument();
  });

  it('works with setState', () => {
    const mockSetState = jest.fn();

    render(
      <Link meeting={mockMeeting} state={mockState} setState={mockSetState} />
    );

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('href', 'https://test.com/');
    expect(link).toHaveTextContent(/foo/i);
    expect(screen.getByText(/men/i)).toBeInTheDocument();

    fireEvent.click(link);

    expect(mockSetState).toHaveBeenCalledWith({
      ...mockState,
      input: { ...mockState.input, meeting: 'bar-baz' },
    });
  });
});
