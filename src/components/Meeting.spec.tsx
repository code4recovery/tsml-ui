import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateTime } from 'luxon';

import { strings } from '../helpers';
import Meeting from './Meeting';

describe('<Meeting />', () => {
  beforeEach(() => {
    window.URL.createObjectURL = jest.fn() as jest.Mock;
  });

  const mockMeeting = {
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
    location: 'Empire State Building',
    notes: 'Testing meeting notes\n\nTesting new line',
    location_notes: 'Testing meeting notes\n\nTesting new line',
    group_notes: 'Testing meeting notes\n\nTesting new line',
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
  };

  const mockState = {
    capabilities: {
      type: true,
    },
    input: {
      meeting: 'foo',
    },
    meetings: {
      foo: mockMeeting,
      bar: mockMeeting,
    },
  };

  it('renders with clickable buttons', () => {
    const { container } = render(
      <Meeting state={mockState} setState={jest.fn()} mapbox="pk.123456" />
    );
    expect(container).toBeTruthy();

    //click type definition
    const type_definition = screen.getByText(strings.types.O);
    expect(type_definition).toBeTruthy();
    fireEvent.click(type_definition);
    fireEvent.click(type_definition);

    //click formatIcs
    const calendar_link = screen.getByText(strings.add_to_calendar);
    expect(calendar_link).toBeTruthy();
    fireEvent.click(calendar_link);

    //click back
    const back_link = screen.getByText(strings.back_to_meetings);
    expect(back_link).toBeTruthy();
    fireEvent.click(back_link);
  });

  it('renders with group info', () => {
    const { container } = render(
      <Meeting
        state={{
          ...mockState,
          meetings: {
            foo: {
              ...mockMeeting,
              group: 'Test',
            },
            bar: {
              ...mockMeeting,
              group: 'Test',
            },
          },
        }}
        setState={jest.fn()}
        mapbox="pk.123456"
        feedback_emails={['test@test.com']}
      />
    );
    expect(container).toBeTruthy();
  });

  it('renders when inactive', () => {
    const { container } = render(
      <Meeting
        state={{
          ...mockState,
          meetings: {
            foo: {
              ...mockMeeting,
              isActive: false,
              isInPerson: false,
            },
            bar: {
              ...mockMeeting,
              start: DateTime.now().plus({ day: 1 }),
            },
          },
        }}
        setState={jest.fn()}
        mapbox="pk.123456"
      />
    );
    expect(container).toBeTruthy();
  });

  it('renders with group but no contact', () => {
    const { container } = render(
      <Meeting
        state={{
          ...mockState,
          meetings: {
            foo: {
              ...mockMeeting,
              group: 'Test',
              start: undefined,
              email: undefined,
              website: undefined,
              phone: undefined,
              venmo: undefined,
              square: undefined,
              paypal: undefined,
            },
            bar: {
              ...mockMeeting,
              isOnline: false,
            },
          },
        }}
        setState={jest.fn()}
        mapbox="pk.123456"
      />
    );
    expect(container).toBeTruthy();
  });
});
