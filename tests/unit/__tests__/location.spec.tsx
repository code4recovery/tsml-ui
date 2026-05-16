import { render, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import {
  ErrorProvider,
  InputProvider,
  LocationProvider,
  SettingsProvider,
  useError,
} from '../../../src/hooks';
import { en } from '../../../src/i18n';

type ErrorCallback = NonNullable<
  Parameters<Geolocation['getCurrentPosition']>[1]
>;

function mockGeolocationError(code: 1 | 2 | 3) {
  const getCurrentPosition = vi.fn((_success, error: ErrorCallback) => {
    error({
      code,
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
      message: '',
    } as GeolocationPositionError);
  });
  Object.defineProperty(window.navigator, 'geolocation', {
    value: { getCurrentPosition },
    configurable: true,
  });
  return getCurrentPosition;
}

function ErrorReader({ onError }: { onError: (error?: string) => void }) {
  const { error } = useError();
  useEffect(() => {
    onError(error);
  }, [error]);
  return null;
}

function renderWithProviders(onError: (error?: string) => void) {
  return render(
    <MemoryRouter initialEntries={['/?mode=me']}>
      <ErrorProvider>
        <SettingsProvider>
          <InputProvider>
            <LocationProvider>
              <ErrorReader onError={onError} />
            </LocationProvider>
          </InputProvider>
        </SettingsProvider>
      </ErrorProvider>
    </MemoryRouter>
  );
}

describe('LocationProvider geolocation errors', () => {
  it('shows the denied message when permission is denied', async () => {
    mockGeolocationError(1);
    const onError = vi.fn();
    renderWithProviders(onError);
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(en.errors.geolocation.denied);
    });
  });

  it('shows the unavailable message when position is unavailable', async () => {
    mockGeolocationError(2);
    const onError = vi.fn();
    renderWithProviders(onError);
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(en.errors.geolocation.unavailable);
    });
  });

  it('shows the timeout message when the request times out', async () => {
    mockGeolocationError(3);
    const onError = vi.fn();
    renderWithProviders(onError);
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(en.errors.geolocation.timeout);
    });
  });
});
