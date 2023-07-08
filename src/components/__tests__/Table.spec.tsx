import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import {
  SettingsContext,
  formatString as i18n,
  mergeSettings,
} from '../../helpers';
import Table from '../Table';
import { mockMeeting, mockState } from '../__fixtures__';

describe('<Table />', () => {
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
    const mockSetState = jest.fn();
    render(
      <SettingsContext.Provider value={settings}>
        <Table
          filteredSlugs={filteredSlugs}
          inProgress={[]}
          listButtons={false}
          setState={mockSetState}
          state={mockStateWithMeeting}
        />
      </SettingsContext.Provider>
    );

    //clickable rows
    const rows = screen.getAllByRole('row');
    rows.forEach(row => fireEvent.click(row));
    expect(mockSetState).toHaveBeenCalledTimes(filteredSlugs.length);
  });

  it('renders with clickable listButtons', () => {
    const mockSetState = jest.fn();
    render(
      <SettingsContext.Provider value={settings}>
        <Table
          filteredSlugs={filteredSlugs}
          inProgress={[]}
          listButtons={false}
          setState={mockSetState}
          state={mockStateWithMeeting}
        />
      </SettingsContext.Provider>
    );

    //clickable links
    const anchors = screen.getAllByRole('link');
    anchors.forEach(anchor => fireEvent.click(anchor));
    expect(mockSetState).toHaveBeenCalledTimes(filteredSlugs.length);

    //unclickable rows
    const rows = screen.getAllByRole('row');
    rows.forEach(row => fireEvent.click(row));
    expect(mockSetState).toHaveBeenCalledTimes(filteredSlugs.length * 2);
  });

  it('displays single meeting in progress', () => {
    const inProgress = [filteredSlugs[0]];
    const mockSetState = jest.fn();

    render(
      <SettingsContext.Provider value={settings}>
        <Table
          filteredSlugs={filteredSlugs}
          inProgress={['foo']}
          listButtons={false}
          setState={mockSetState}
          state={mockStateWithMeeting}
        />
      </SettingsContext.Provider>
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
    const mockSetState = jest.fn();

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
      <SettingsContext.Provider value={settings}>
        <Table
          filteredSlugs={multiFilteredSlugs}
          inProgress={inProgress}
          listButtons={false}
          setState={mockSetState}
          state={mockStateWithMeetings}
        />
      </SettingsContext.Provider>
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
