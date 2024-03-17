import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import List from '../../src/components/List';
import {
  SettingsProvider,
  formatString as i18n,
  mergeSettings,
} from '../../src/helpers';
import { mockMeeting, mockState } from '../__fixtures__';

describe('<List />', () => {
  const mockStateWithMeeting = {
    ...mockState,
    meetings: {
      [mockMeeting.slug]: mockMeeting,
    },
  };
  const filteredSlugs = Object.keys(mockStateWithMeeting.meetings);
  const { strings } = mergeSettings();
  const settings = mergeSettings();

  it('renders with clickable rows', () => {
    render(
      <MemoryRouter>
        <SettingsProvider value={settings}>
          <List filteredSlugs={filteredSlugs} inProgress={[]} />
        </SettingsProvider>
      </MemoryRouter>
    );

    const rows = screen.getAllByRole('row');
    rows.forEach(row => fireEvent.click(row));

    // todo expect location to be changed
    // expect(mockSetState).toHaveBeenCalledTimes(filteredSlugs.length);
  });

  it('displays single meeting in progress', () => {
    const inProgress = [filteredSlugs[0]];

    render(
      <MemoryRouter>
        <SettingsProvider value={settings}>
          <List filteredSlugs={filteredSlugs} inProgress={['foo']} />
        </SettingsProvider>
      </MemoryRouter>
    );

    //count rows (data rows + header + show in progress)
    expect(screen.getAllByRole('row')).toHaveLength(filteredSlugs.length + 2);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(strings.in_progress_single);

    fireEvent.click(button);
    expect(button).not.toBeVisible();

    //recount rows
    expect(screen.getAllByRole('row')).toHaveLength(
      filteredSlugs.length + inProgress.length + 1
    );
  });

  it('displays multiple meetings in progress', () => {
    const mockStateWithMeetings = {
      ...mockStateWithMeeting,
      meetings: {
        ...mockStateWithMeeting.meetings,
        'bar': {
          ...mockMeeting,
        },
      },
    };

    const multiFilteredSlugs = Object.keys(mockStateWithMeetings.meetings);
    const inProgress = [...multiFilteredSlugs];

    render(
      <MemoryRouter>
        <SettingsProvider value={settings}>
          <List filteredSlugs={multiFilteredSlugs} inProgress={inProgress} />
        </SettingsProvider>
      </MemoryRouter>
    );

    //count rows (data rows + header + show in progress)
    expect(screen.getAllByRole('row')).toHaveLength(
      multiFilteredSlugs.length + 2
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(
      i18n(strings.in_progress_multiple, { count: multiFilteredSlugs.length })
    );

    fireEvent.click(button);
    expect(button).not.toBeVisible();

    //recount rows
    expect(screen.getAllByRole('row')).toHaveLength(
      multiFilteredSlugs.length + inProgress.length + 1
    );
  });
});
