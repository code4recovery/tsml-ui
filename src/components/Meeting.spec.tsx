import { render, screen, fireEvent } from '@testing-library/react';
import moment from 'moment-timezone';

import { strings } from '../helpers';
import Meeting from './Meeting';

describe('<Meeting />', () => {
  const mockState = {
    capabilities: {
      type: true,
    },
    input: {
      meeting: 'foo',
    },
    meetings: {
      'foo': {
        isInPerson: true,
        isOnline: true,
        latitude: 40.712776,
        longitude: -74.005974,
        name: 'First Meeting',
        start: moment(),
        types: ['O', 'M', 'X'],
        timezone: 'America/New_York',
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
      },
    },
  };

  mockState.meetings['bar'] = { ...mockState.meetings.foo };

  //save copy of original
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

  //override getboundingclientrect
  beforeAll(() => {
    Element.prototype.getBoundingClientRect = jest.fn(
      () =>
        ({
          width: 120,
          height: 120,
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        } as DOMRect)
    );
  });

  //restore original
  afterAll(() => {
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });

  it('renders with clickable buttons', () => {
    const { container } = render(
      <Meeting state={mockState} setState={jest.fn()} mapbox="pk.123456" />
    );
    expect(container).toBeTruthy();

    //click type definition
    const type_definition = screen.getByText(strings.types.O);
    expect(type_definition).toBeTruthy();
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
              ...mockState.meetings.foo,
              group: 'Test',
            },
            bar: {
              ...mockState.meetings.bar,
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
});
