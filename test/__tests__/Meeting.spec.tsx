import React from 'react';

import { render, fireEvent } from '@testing-library/react';
import { DateTime } from 'luxon';
import { MemoryRouter } from 'react-router-dom';

import Meeting from '../../src/components/Meeting';
import { SettingsContext, mergeSettings } from '../../src/helpers';
import { en } from '../../src/i18n';

import type { Meeting as MeetingType, State } from '../../src/types';

describe('<Meeting />', () => {
  beforeEach(() => {
    window.URL.createObjectURL = jest.fn() as jest.Mock;
  });

  const mockMeeting: MeetingType = {
    slug: 'test',
    isInPerson: true,
    isOnline: true,
    isActive: true,
    latitude: 40.712776,
    longitude: -74.005974,
    name: 'First Meeting',
    start: DateTime.now(),
    end: DateTime.now(),
    types: ['O', 'M', 'X'],
    timezone: 'America/New_York',
    approximate: false,
    formatted_address: '123 Main St, New York, NY 12345, USA',
    email: 'test@test.com',
    venmo: '@test',
    square: '$test',
    paypal: 'https://paypal.me/test',
    homegroup_online: 'test',
    location: 'Empire State Building',
    notes: 'Testing meeting notes\n\nTesting new line',
    location_notes: 'Testing location notes\n\nTesting new line',
    group: 'Test Group',
    group_notes: 'Testing group notes\n\nTesting new line',
    website: 'https://test.com',
    phone: '+18005551212',
    regions: ['Manhattan', 'Midtown'],
    district: 'District 13',
    conference_url: 'https://zoom.us/d/123456789',
    conference_url_notes: 'Test',
    conference_phone: '+1234567890',
    conference_phone_notes: 'Test',
    conference_provider: 'Zoom',
    updated: '2/17/22',
    contact_1_name: 'Contact 1',
    contact_1_email: 'contact1@test.com',
    contact_1_phone: '+18005551212',
    contact_2_email: 'contact2@test.com',
    contact_2_phone: '+18005551212',
  };

  const mockState: State = {
    capabilities: {
      coordinates: true,
      distance: true,
      geolocation: true,
      inactive: true,
      location: true,
      region: true,
      sharing: false,
      time: true,
      type: true,
      weekday: true,
    },
    indexes: {
      distance: [],
      region: [],
      time: [],
      type: [],
      weekday: [],
    },
    input: {
      distance: [],
      meeting: 'foo',
      mode: 'search',
      region: [],
      time: [],
      type: [],
      view: 'table',
      weekday: [],
    },
    loading: false,
    meetings: {
      foo: mockMeeting,
      bar: mockMeeting,
    },
    ready: true,
  };

  it('renders with clickable buttons', () => {
    const { getByText } = render(
      <MemoryRouter>
        <SettingsContext.Provider value={mergeSettings()}>
          <Meeting state={mockState} setState={jest.fn()} />
        </SettingsContext.Provider>
      </MemoryRouter>
    );

    // click type definition
    const type_definition = getByText(en.types.O);
    expect(type_definition).toBeTruthy();
    fireEvent.click(type_definition);
    const type_definition_text = getByText(en.type_descriptions.O);
    expect(type_definition_text).toBeVisible();
    fireEvent.click(type_definition);
    expect(type_definition_text).not.toBeVisible();

    // click formatIcs
    const calendar_link = getByText(en.add_to_calendar);
    expect(calendar_link).toBeVisible();
    fireEvent.click(calendar_link);

    // click back
    const back_link = getByText(en.back_to_meetings);
    expect(back_link).toBeVisible();
    fireEvent.click(back_link);
  });

  it('renders with group info', () => {
    const { getByText } = render(
      <MemoryRouter>
        <Meeting state={mockState} setState={jest.fn()} />
      </MemoryRouter>
    );

    const group = getByText(mockMeeting.group!);
    expect(group).toBeVisible();

    const group_notes = getByText(mockMeeting.group_notes!.split('\n')[0]);
    expect(group_notes).toBeVisible();
  });

  it('renders with contact 1 but no contact 2', () => {
    const { getByText, queryByText } = render(
      <MemoryRouter>
        <Meeting state={mockState} setState={jest.fn()} />
      </MemoryRouter>
    );
    const contact1text = getByText(`Text ${mockMeeting.contact_1_name}`);
    expect(contact1text).toHaveAttribute(
      'href',
      `sms:${mockMeeting.contact_1_phone}`
    );
    const contact1email = getByText(`Email ${mockMeeting.contact_1_name}`);
    expect(contact1email).toHaveAttribute(
      'href',
      `mailto:${mockMeeting.contact_1_email}`
    );
    const contact2text = queryByText(`Text ${mockMeeting.contact_2_name}`);
    expect(contact2text).toBeNull();
  });

  it('renders when inactive', () => {
    const { getByText } = render(
      <MemoryRouter>
        <Meeting
          state={{
            ...mockState,
            meetings: {
              foo: {
                ...mockMeeting,
                isActive: false,
                isInPerson: false,
                types: ['X', 'inactive'],
                end: DateTime.now().plus({ days: 1 }),
              },
            },
          }}
          setState={jest.fn()}
        />
      </MemoryRouter>
    );
    const inactiveType = getByText(en.types.inactive);
    expect(inactiveType).toBeVisible();
  });

  it('renders appointment', () => {
    const { getByText } = render(
      <MemoryRouter>
        <Meeting
          state={{
            ...mockState,
            meetings: {
              foo: {
                ...mockMeeting,
                start: undefined,
                end: undefined,
              },
            },
          }}
          setState={jest.fn()}
        />
      </MemoryRouter>
    );
    const appointmentText = getByText(en.appointment);
    expect(appointmentText).toBeVisible();
  });
});
