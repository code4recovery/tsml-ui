import { describe, expect, it } from 'vitest';
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

  it('supports Zoom meeting URLs with /j/ format', () => {
    expect(
      formatConferenceProvider('https://zoom.us/j/1234567890', defaults)
    ).toStrictEqual('Zoom');
    expect(
      formatConferenceProvider('https://us02web.zoom.us/j/388499177', defaults)
    ).toStrictEqual('Zoom');
  });

  it('supports Zoom registration URLs', () => {
    expect(
      formatConferenceProvider(
        'https://us02web.zoom.us/meeting/register/tZAucu2pqjIpHtCNCNQ_R3OM7r6m6poOxArr#/registration',
        defaults
      )
    ).toStrictEqual('Zoom');
  });
});
