import { render } from '@testing-library/react';
import moment from 'moment-timezone';

import Map from './Map';

describe('<Map />', () => {
  const mockState = {
    meetings: {
      'foo': {
        latitude: 40.712776,
        longitude: -74.005974,
        isInPerson: true,
        start: moment(),
      },
    },
  };
  const mockSetState = jest.fn();

  it('renders with one meeting', () => {
    const { container } = render(
      <Map
        filteredSlugs={Object.keys(mockState.meetings)}
        listMeetingsInPopup={true}
        state={mockState}
        setState={mockSetState}
        mapbox="pk.123456"
      />
    );
    expect(container).toBeTruthy();
  });

  it('renders with multiple meetings', () => {
    const mockStateMultiple = {
      ...mockState,
      meetings: {
        ...mockState.meetings,
        'bar': {
          latitude: 34.052235,
          longitude: -118.243683,
          isInPerson: true,
          start: moment(),
        },
      },
    };
    const { container } = render(
      <Map
        filteredSlugs={Object.keys(mockStateMultiple.meetings)}
        listMeetingsInPopup={true}
        state={mockStateMultiple}
        setState={mockSetState}
        mapbox="pk.123456"
      />
    );
    expect(container).toBeTruthy();
  });
});
