import { fireEvent, render, screen } from '@testing-library/react';
import Controls from './Controls';

describe('<Controls />', () => {
  jest.useFakeTimers();
  const mockState = {
    capabilities: {
      coordinates: true,
      region: true,
      distance: true,
    },
    indexes: {
      distance: [{ name: 'Foo', key: 'foo', slugs: [] }],
      region: [{ name: 'Bar', key: 'bar', slugs: [] }],
    },
    input: {
      mode: 'search',
      distance: [],
      region: [],
      search: 'foo',
    },
    meetings: {
      odaat: {},
      'sunday-serenity': {},
    },
  };

  it('renders', () => {
    const { container } = render(
      <Controls state={mockState} setState={jest.fn()} mapbox="pk.abc123" />
    );
    jest.runAllTimers();
    expect(container).toBeTruthy();
  });

  it('has clickable dropdowns', () => {
    const mockSetState = jest.fn();
    const { container } = render(
      <Controls state={mockState} setState={mockSetState} mapbox="pk.abc123" />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    fireEvent.click(buttons[1]);
  });
});
