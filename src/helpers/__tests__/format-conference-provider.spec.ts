import { settings } from '../settings';
import { formatConferenceProvider } from '../format-conference-provider';

describe('formatConferenceProvider', () => {
  it.each(['foo', 'https://', 'https://foo.com'])(
    'yields undefined with %s',
    input => expect(formatConferenceProvider(input)).toStrictEqual(undefined)
  );

  it('returns title when a valid provider is found', () => {
    const [[url, name]] = Object.entries(settings.conference_providers);
    expect(formatConferenceProvider(`https://${url}`)).toStrictEqual(name);
  });
});
