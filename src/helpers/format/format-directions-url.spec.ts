import { formatDirectionsUrl } from './format-directions-url';

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
