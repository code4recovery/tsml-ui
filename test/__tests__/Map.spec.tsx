import { render } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import Map from '../../src/components/Map';

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  Popup: () => <div data-testid="popup" />,
  useMap: () => ({
    setView: vi.fn(),
  }),
}));

// Mock leaflet
vi.mock('leaflet', () => ({
  Icon: {
    Default: {
      mergeOptions: vi.fn(),
    },
  },
  divIcon: vi.fn(),
  Point: vi.fn().mockImplementation((x, y) => ({
    x,
    y,
    add: vi.fn().mockImplementation(otherPoint => ({
      x: x + otherPoint.x,
      y: y + otherPoint.y,
    })),
    equals: vi
      .fn()
      .mockImplementation(
        otherPoint => x === otherPoint.x && y === otherPoint.y
      ),
    toString: vi.fn().mockImplementation(() => `Point(${x}, ${y})`),
  })),
}));

describe('<Map />', () => {
  //save copy of original
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;

  //override getboundingclientrect
  beforeAll(() => {
    Element.prototype.getBoundingClientRect = vi.fn(
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
    const { container } = render(<Map />);
    expect(container).toBeTruthy();
  });

  it('renders with multiple meetings', () => {
    const { container } = render(<Map />);
    expect(container).toBeTruthy();
  });
});
