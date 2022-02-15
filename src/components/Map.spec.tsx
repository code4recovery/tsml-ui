import { render } from '@testing-library/react';
import moment from 'moment-timezone';

import Map from './Map';

describe('<Map />', () => {
  const mockState = {
    meetings: {
      'foo': {
        isInPerson: true,
        latitude: 40.712776,
        longitude: -74.005974,
        name: 'First Meeting',
        start: moment(),
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
        state={mockState}
        setState={jest.fn()}
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
          isInPerson: true,
          latitude: 34.052235,
          longitude: -118.243683,
          name: 'Second Meeting',
          start: moment(),
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

    /*todo wait for map to load
    const { latitude, longitude, name } = mockStateMultiple.meetings.bar;
    const marker = screen.getByTestId(`${latitude},${longitude}`);
    fireEvent.click(marker);

    const h4 = screen.getByText(name);
    expect(h4).toBeVisible();
    */
  });
});
