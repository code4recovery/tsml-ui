import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { iOS } from '../../src/helpers/user-agent';

let platformGetter: ReturnType<typeof vi.spyOn>;
let userAgentGetter: ReturnType<typeof vi.spyOn>;

describe('iOS', () => {
  beforeEach(() => {
    platformGetter = vi.spyOn(window.navigator, 'platform', 'get');
    userAgentGetter = vi.spyOn(window.navigator, 'userAgent', 'get');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('detects iOS', () => {
    platformGetter.mockReturnValue('iPhone');
    const isIOS = iOS();
    expect(isIOS).toBe(true);
  });

  it('detects Mac (not iPad)', () => {
    platformGetter.mockReturnValue('MacIntel');
    userAgentGetter.mockReturnValue('Firefox');
    const isIOS = iOS();
    expect(isIOS).toBe(false);
  });
});
