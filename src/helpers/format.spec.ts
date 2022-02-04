import { formatDirectionsUrl } from '.';
import {
  formatAddress,
  formatArray,
  formatClasses,
  formatConferenceProvider,
} from './format';
import { settings } from './settings';

//formatAddress
describe('formatAddress', () => {
  it('returns first part of address if length > 3', () => {
    expect(formatAddress('foo, bar, baz, qux')).toStrictEqual('foo');
  });

  it.each([undefined, 'foo, bar, baz'])('yields null with %s', input => {
    expect(formatAddress(input)).toStrictEqual(null);
  });
});

//formatArray
describe('formatArray', () => {
  it.each`
    input             | expected
    ${[]}             | ${[]}
    ${'foo'}          | ${['foo']}
    ${{ foo: 'bar' }} | ${['bar']}
    ${undefined}      | ${[]}
  `('yields $expected with $input', ({ input, expected }) => {
    expect(formatArray(input)).toStrictEqual(expected);
  });
});

//formatConferenceProvider
describe('formatConferenceProvider', () => {
  it.each(['foo', 'https://', 'https://foo.com'])(
    'yields null with %s',
    input => expect(formatConferenceProvider(input)).toStrictEqual(null)
  );

  it('returns title when a valid provider is found', () => {
    const [[url, name]] = Object.entries(settings.conference_providers);
    expect(formatConferenceProvider(`https://${url}`)).toStrictEqual(name);
  });
});

//formatClasses
describe('formatClasses', () => {
  it.each`
    input             | expected
    ${'foo'}          | ${'foo'}
    ${{ foo: true }}  | ${'foo'}
    ${{ foo: false }} | ${''}
    ${undefined}      | ${''}
    ${['foo']}        | ${'foo'}
  `('yields $expected with $input', ({ input, expected }) => {
    expect(formatClasses(input)).toStrictEqual(expected);
  });
});

//formatDirectionsUrl
describe('formatDirectionsUrl', () => {
  const { formatted_address, latitude, longitude } = {
    formatted_address: 'foo',
    latitude: 1,
    longitude: 1,
  };

  const baseUrl = 'https://www.google.com/maps?saddr=Current+Location&daddr=';
  const iosBaseUrl = 'maps://?saddr=Current+Location&daddr=';

  it.each`
    input                                         | expected
    ${{ formatted_address }}                      | ${'foo'}
    ${{ formatted_address, latitude }}            | ${'foo'}
    ${{ formatted_address, latitude, longitude }} | ${'1%2C1&q=foo'}
  `('yields $expected with $input', ({ input, expected }) => {
    //test non-ios
    expect(formatDirectionsUrl(input)).toStrictEqual(baseUrl + expected);

    //change platform to ios - TODO: platform is deprecated
    Object.defineProperty(navigator, 'platform', {
      value: 'iPhone',
      writable: true,
    });

    //test ios
    expect(formatDirectionsUrl(input)).toStrictEqual(iosBaseUrl + expected);

    //reset
    (navigator as any).platform = undefined;
  });
});

//formatFeedbackEmail
it.todo('formatFeedbackEmail');

//formatIcs
it.todo('formatIcs');

//formatSlug
it.todo('formatSlug');

//formatUrl
it.todo('formatUrl');
