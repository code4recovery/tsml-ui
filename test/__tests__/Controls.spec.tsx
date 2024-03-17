import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Controls from '../../src/components/Controls';
import { mergeSettings, SettingsProvider } from '../../src/helpers';

describe('<Controls />', () => {
  jest.useFakeTimers();

  const mockSetState = jest.fn();

  const settings = mergeSettings();
  const { region_any, modes, views } = settings.strings;

  it('is empty with no meetings', () => {
    const { container } = render(
      <MemoryRouter>
        <SettingsProvider value={settings}>
          <Controls />
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it('has clickable dropdowns', () => {
    render(
      <MemoryRouter>
        <Controls />
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
    expect(mockSetState).toBeCalledTimes(1);

    jest.runAllTimers();
  });

  it('has working text search', () => {
    render(
      <MemoryRouter>
        <Controls />
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

    expect(mockSetState).toBeCalledTimes(2);

    jest.runAllTimers();
  });

  it('has working location search', () => {
    render(
      <MemoryRouter>
        <Controls />
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
    const mapButton = screen.getByLabelText(views.map);
    fireEvent.click(mapButton);

    expect(mockSetState).toBeCalledTimes(4);
  });
});
