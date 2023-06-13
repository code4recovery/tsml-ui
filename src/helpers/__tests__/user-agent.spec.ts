import { iOS } from '../user-agent';

let platformGetter: jest.SpyInstance<string, []>;
let userAgentGetter: jest.SpyInstance<string, []>;

describe('iOS', () => {
  beforeEach(() => {
    platformGetter = jest.spyOn(window.navigator, 'platform', 'get');
    userAgentGetter = jest.spyOn(window.navigator, 'userAgent', 'get');
  });

  it('detects iOS', () => {
    platformGetter.mockReturnValue('iPhone');
    const isIOS = iOS();
    expect(isIOS).toBe(true);
  });

  it('detects Mac', () => {
    platformGetter.mockReturnValue('MacIntel');
    userAgentGetter.mockReturnValue('Mac');
    const isIOS = iOS();
    expect(isIOS).toBe(false);
  });
});
