import React from 'react';

import '@testing-library/jest-dom';

import { render } from '@testing-library/react';
import { DateTime } from 'luxon';

import Map from '../../src/components/Map';
import { mockState } from '../__fixtures__';

describe('<Map />', () => {
  const mockStateWithMeeting = {
    ...mockState,
    meetings: {
      foo: {
        formatted_address: 'New York, NY, USA',
        slug: 'foo',
        isInPerson: true,
        latitude: 40.712776,
        longitude: -74.005974,
        name: 'First Meeting',
        start: DateTime.now(),
      },
    },
  };

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

  it('renders with one meeting', () => {
    const { container } = render(
      <Map
        filteredSlugs={Object.keys(mockState.meetings)}
        listMeetingsInPopup={false}
        state={mockStateWithMeeting}
        setState={jest.fn()}
        mapbox="pk.123456"
      />
    );
    expect(container).toBeTruthy();
  });

  it('renders with multiple meetings', () => {
    const mockStateMultiple = {
      ...mockStateWithMeeting,
      meetings: {
        ...mockState.meetings,
        bar: {
          formatted_address: 'Los Angeles, CA, USA',
          slug: 'bar',
          isInPerson: true,
          latitude: 34.052235,
          longitude: -118.243683,
          name: 'Second Meeting',
          start: DateTime.now(),
        },
      },
    };
    const { container } = render(
      <Map
        filteredSlugs={Object.keys(mockStateMultiple.meetings)}
        listMeetingsInPopup={true}
        state={mockStateMultiple}
        setState={jest.fn()}
        mapbox="pk.123456"
      />
    );
    expect(container).toBeTruthy();
  });
});
