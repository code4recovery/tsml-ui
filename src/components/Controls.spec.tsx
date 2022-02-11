import { fireEvent, render, screen } from '@testing-library/react';
import Controls from './Controls';
import { strings } from '../helpers';

describe('<Controls />', () => {
  jest.useFakeTimers();
  const mockState = {
    capabilities: {
      coordinates: true,
      geolocation: true,
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
      view: 'list',
    },
    meetings: {
      foo: { search: 'foo' },
      bar: { search: 'bar' },
    },
  };

  it('has clickable dropdowns', () => {
    const mockSetState = jest.fn();
    render(
      <Controls state={mockState} setState={mockSetState} mapbox="pk.abc123" />
    );

    const buttons = screen.getAllByText(strings.region_any);
    fireEvent.click(buttons[0]);

    const dropdown = screen.getByLabelText(strings.region_any);
    expect(dropdown).toBeVisible();

    fireEvent.click(document.body);
    //expect(dropdown).not.toBeVisible();

    const locationLink = screen.getByText(strings.modes.location);
    fireEvent.click(locationLink);

    jest.runAllTimers();

    //expect stateful thing to happen
    expect(mockSetState).toBeCalledTimes(1);
  });

  it('has working search', () => {
    const mockSetState = jest.fn();

    render(
      <Controls state={mockState} setState={mockState} mapbox="pk.abc123" />
    );

    const input = screen.getAllByLabelText(strings.modes.search)[0];
    fireEvent.change(input, { value: 'foo' });

    //expect(mockSetState).toBeCalledWith({ ...mockState });
  });

  it('has working location search', () => {
    const mockSetState = jest.fn();
    const { container } = render(
      <Controls
        state={{
          ...mockState,
          input: { ...mockState.input, mode: 'location', view: 'map' },
        }}
        setState={mockSetState}
        mapbox="pk.abc123"
      />
    );

    const input = screen.getAllByLabelText(strings.modes.search)[0];
    fireEvent.change(input, { value: 'foo' });

    const mapButton = screen.getByLabelText(strings.views.map);
    fireEvent.click(mapButton);

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    //expect ?
  });
});
