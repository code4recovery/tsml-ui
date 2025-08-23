import { formatConferenceProvider } from '../../src/helpers/format-conference-provider';
import { defaults } from '../../src/hooks';

describe('formatConferenceProvider', () => {
  it.each(['foo', 'https://', 'https://foo.com'])(
    'yields undefined with %s',
    input =>
      expect(formatConferenceProvider(input, defaults)).toStrictEqual(undefined)
  );

  it('returns title when a valid provider is found', () => {
    const [[url, name]] = Object.entries(defaults.conference_providers);
    expect(formatConferenceProvider(`https://${url}`, defaults)).toStrictEqual(
      name
    );
  });
});
