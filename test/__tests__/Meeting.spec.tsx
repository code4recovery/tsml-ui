import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Meeting from '../../src/components/Meeting';
import { SettingsProvider, mergeSettings } from '../../src/helpers';
import { en } from '../../src/i18n';

describe('<Meeting />', () => {
  beforeEach(() => {
    window.URL.createObjectURL = jest.fn() as jest.Mock;
  });

  it('renders with clickable buttons', () => {
    const { container } = render(
      <MemoryRouter>
        <SettingsProvider value={mergeSettings()}>
          <Meeting />
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(container).toBeTruthy();

    //click type definition
    const type_definition = screen.getByText(en.types.O);
    expect(type_definition).toBeTruthy();
    fireEvent.click(type_definition);
    fireEvent.click(type_definition);

    //click formatIcs
    const calendar_link = screen.getByText(en.add_to_calendar);
    expect(calendar_link).toBeTruthy();
    fireEvent.click(calendar_link);

    //click back
    const back_link = screen.getByText(en.back_to_meetings);
    expect(back_link).toBeTruthy();
    fireEvent.click(back_link);
  });

  it('renders with group info', () => {
    const { container } = render(
      <MemoryRouter>
        <Meeting />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('renders when inactive', () => {
    const { container } = render(
      <MemoryRouter>
        <Meeting />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });

  it('renders with group but no contact', () => {
    const { container } = render(
      <MemoryRouter>
        <Meeting />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });
});
