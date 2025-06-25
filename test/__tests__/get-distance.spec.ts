import { getDistance } from '../../src/helpers/get-distance';
import { defaults as settings } from '../../src/hooks';

import type { Meeting } from '../../src/types';

describe('distance', () => {
  // exact
  it('returns 0 for exact location', () => {
    const meeting: Meeting = {
      name: 'Test meeting',
      slug: 'test',
      latitude: 1,
      longitude: 1,
      formatted_address: '123 Main St, Anytown, OK 12345, USA',
    };
    expect(
      getDistance({ latitude: 1, longitude: 1 }, meeting, settings)
    ).toStrictEqual(0);
  });

  // miles
  it.each`
    a                                    | b                                    | expected
    ${{ latitude: 1, longitude: 1 }}     | ${{ latitude: 2, longitude: 2 }}     | ${97.7}
    ${{ latitude: 10, longitude: 10 }}   | ${{ latitude: 20, longitude: 20 }}   | ${960}
    ${{ latitude: 100, longitude: 100 }} | ${{ latitude: 200, longitude: 200 }} | ${7698}
  `('miles: yields $expected with $a and $b', ({ a, b, expected }) => {
    expect(getDistance(a, b, settings)).toStrictEqual(expected);
  });

  // kilometers
  it.each`
    a                                    | b                                    | expected
    ${{ latitude: 1, longitude: 1 }}     | ${{ latitude: 2, longitude: 2 }}     | ${157}
    ${{ latitude: 10, longitude: 10 }}   | ${{ latitude: 20, longitude: 20 }}   | ${1545}
    ${{ latitude: 100, longitude: 100 }} | ${{ latitude: 200, longitude: 200 }} | ${12388}
  `('kilometers: yields $expected with $a and $b', ({ a, b, expected }) => {
    settings.distance_unit = 'km';
    expect(getDistance(a, b, settings)).toStrictEqual(expected);
  });

  // undefined checks
  it.each`
    a                                | b
    ${undefined}                     | ${undefined}
    ${{ latitude: 1 }}               | ${undefined}
    ${{ longitude: 1 }}              | ${undefined}
    ${{ latitude: 1, longitude: 1 }} | ${undefined}
    ${undefined}                     | ${{ latitude: 1 }}
    ${undefined}                     | ${{ longitude: 1 }}
    ${undefined}                     | ${{ latitude: 1, longitude: 1 }}
    ${{ latitude: 1 }}               | ${{ latitude: 1 }}
    ${{ latitude: 1, longitude: 1 }} | ${{ latitude: 1 }}
    ${{ latitude: 1 }}               | ${{ latitude: 1, longitude: 1 }}
  `('yields undefined with $a and $b', ({ a, b }) => {
    expect(getDistance(a, b, settings)).toStrictEqual(undefined);
  });
});
