import { render } from '@testing-library/react';
import moment from 'moment-timezone';

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
        latitude: 40.712776,
        longitude: -74.005974,
        name: 'First Meeting',
        start: moment(),
        types: ['O', 'M', 'X'],
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

  it('renders', () => {
    const { container } = render(
      <Meeting state={mockState} setState={jest.fn()} mapbox="pk.123456" />
    );
    expect(container).toBeTruthy();
  });
});
