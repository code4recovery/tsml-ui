import { formatDirectionsUrl } from '../../src/helpers/format-directions-url';

describe('formatDirectionsUrl', () => {
  const { formatted_address, latitude, longitude } = {
    formatted_address: 'foo',
    latitude: 1,
    longitude: 1,
  };

  const baseUrl = 'https://www.google.com/maps/dir/?api=1&destination=';
  const iosBaseUrl = 'http://maps.apple.com/?daddr=';

  it.each`
    input                                         | expectedIos      | expectedGoogle
    ${{ formatted_address }}                      | ${'foo'}         | ${'foo'}
    ${{ formatted_address, latitude }}            | ${'foo'}         | ${'foo'}
    ${{ formatted_address, latitude, longitude }} | ${'1%2C1&q=foo'} | ${'1%2C1'}
  `(
    'yields $expected with $input',
    ({ input, expectedIos, expectedGoogle }) => {
      //test non-ios
      expect(formatDirectionsUrl(input)).toStrictEqual(
        baseUrl + expectedGoogle
      );

      //change platform to ios - TODO: platform is deprecated
      Object.defineProperty(navigator, 'platform', {
        value: 'iPhone',
        writable: true,
      });

      //test ios
      expect(formatDirectionsUrl(input)).toStrictEqual(
        iosBaseUrl + expectedIos
      );

      //reset
      (navigator as any).platform = undefined;
    }
  );
});
