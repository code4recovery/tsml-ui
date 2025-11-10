import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import Controls from '../../src/components/Controls';
import { defaults, SettingsProvider } from '../../src/hooks';

describe('<Controls />', () => {
  const settings = defaults;

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
