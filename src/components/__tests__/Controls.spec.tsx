import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Controls from '../Controls';
import { mergeSettings, SettingsContext } from '../../helpers';
import { mockMeeting, mockState } from '../__fixtures__';

describe('<Controls />', () => {
  jest.useFakeTimers();

  const mockStateWithControls = {
    ...mockState,
    capabilities: {
      ...mockState.capabilities,
      coordinates: true,
      geolocation: true,
      region: true,
      distance: true,
    },
    indexes: {
      ...mockState.indexes,
      distance: [{ name: 'Foo', key: 'foo', slugs: [] }],
      region: [{ name: 'Bar', key: 'bar', slugs: [] }],
    },
    meetings: {
      foo: { ...mockMeeting, search: 'foo' },
      bar: { ...mockMeeting, search: 'bar' },
    },
  };

  const mockSetState = jest.fn();

  const mapbox = 'pk.abc123';

  const settings = mergeSettings();
  const { region_any, modes, views } = settings.strings;

  it('is empty with no meetings', () => {
    const { container } = render(
      <SettingsContext.Provider value={settings}>
        <Controls state={mockState} setState={mockSetState} />
      </SettingsContext.Provider>
    );
    expect(container.firstChild).toBeNull();
  });

  it('has clickable dropdowns', () => {
    render(
      <Controls
        state={mockStateWithControls}
        setState={mockSetState}
        mapbox={mapbox}
      />
    );

    //click a dropdown button
    const button = screen.getAllByRole('button', { name: region_any });
    fireEvent.click(button[0]);

    //dropdown opens
    const dropdown = screen.getByLabelText(region_any);
    expect(dropdown).toHaveClass('show');

    //dropdown closes
    fireEvent.click(document.body);
    expect(dropdown).not.toHaveClass('show');

    //change the search mode
    const locationLink = screen.getByText(modes.location);
    fireEvent.click(locationLink);

    //expect stateful thing to happen
    expect(mockSetState).toBeCalledTimes(1);

    jest.runAllTimers();
  });

  it('has working text search', () => {
    render(<Controls state={mockStateWithControls} setState={mockSetState} />);

    //text search
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'foo' } });

    //try submitting
    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    expect(mockSetState).toBeCalledTimes(2);

    jest.runAllTimers();
  });

  it('has working location search', () => {
    render(
      <Controls
        state={{
          ...mockStateWithControls,
          input: {
            ...mockStateWithControls.input,
            mode: 'location',
            view: 'map',
          },
        }}
        setState={mockSetState}
        mapbox={mapbox}
      />
    );

    //enter search values
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'bar' } });

    //submit form
    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    //toggle
    const button = screen.getByRole('button', { name: modes.location });
    fireEvent.click(button);
    fireEvent.click(button);

    //toggle map button
    const mapButton = screen.getByLabelText(views.map);
    fireEvent.click(mapButton);

    expect(mockSetState).toBeCalledTimes(4);
  });
});
