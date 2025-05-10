import React from 'react';

import { render } from '@testing-library/react';
import { DateTime } from 'luxon';

import Map from '../../src/components/Map';
import { mockState } from '../__fixtures__';

// Mock react-leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  Popup: () => <div data-testid="popup" />,
}));

// Mock leaflet
jest.mock('leaflet', () => ({
  Icon: {
    Default: {
      mergeOptions: jest.fn(),
    },
  },
}));

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
      />
    );
    expect(container).toBeTruthy();
  });

  it('configures Leaflet marker icons correctly', () => {
    const { Icon } = require('leaflet');
    render(
      <Map
        filteredSlugs={Object.keys(mockStateWithMeeting.meetings)}
        listMeetingsInPopup={false}
        state={mockStateWithMeeting}
        setState={jest.fn()}
      />
    );

    expect(Icon.Default.mergeOptions).toHaveBeenCalledWith({
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  });
});
