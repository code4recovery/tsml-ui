import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Controls from '../../src/components/Controls';
import { defaults, SettingsProvider } from '../../src/hooks';
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

  const settings = defaults;
  const { region_any, modes, views } = settings.strings;

  it('is empty with no meetings', () => {
    const { container } = render(
      <MemoryRouter>
        <SettingsProvider userSettings={settings}>
          <Controls />
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });
});
