import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Controls from '../../src/components/Controls';
import { mergeSettings, SettingsContext } from '../../src/helpers';
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

  const settings = mergeSettings();
  const { region_any, modes, views } = settings.strings;

  it('is empty with no meetings', () => {
    const { container } = render(
      <MemoryRouter>
        <SettingsContext.Provider value={settings}>
          <Controls state={mockState} setState={mockSetState} />
        </SettingsContext.Provider>
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it('has clickable dropdowns', () => {
    render(
      <MemoryRouter>
        <Controls state={mockStateWithControls} setState={mockSetState} />
      </MemoryRouter>
    );

    //click a dropdown button
    const button = screen.getAllByRole('button', { name: region_any });
    fireEvent.click(button[0]);

    //dropdown opens
    const dropdown = screen.getByLabelText(region_any);
    expect(dropdown).toBeVisible();

    //dropdown closes
    fireEvent.click(document.body);
    expect(dropdown).not.toBeVisible();

    //change the search mode
    const locationLink = screen.getByText(modes.location);
    fireEvent.click(locationLink);

    //expect stateful thing to happen
    expect(mockSetState).toHaveBeenCalledTimes(1);

    jest.runAllTimers();
  });

  it('has working text search', () => {
    render(
      <MemoryRouter>
        <Controls state={mockStateWithControls} setState={mockSetState} />
      </MemoryRouter>
    );

    //text search
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'foo' } });

    //try submitting
    const form = input.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    expect(mockSetState).toHaveBeenCalledTimes(2);

    jest.runAllTimers();
  });

  it('has working location search', () => {
    render(
      <MemoryRouter>
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
        />
      </MemoryRouter>
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
    const mapButton = screen.getByText(views.map);
    fireEvent.click(mapButton);

    expect(mockSetState).toHaveBeenCalledTimes(4);
  });
});
