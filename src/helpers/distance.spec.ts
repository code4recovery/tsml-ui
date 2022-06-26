import { distance } from './distance';
import { settings } from './settings';
import type { Meeting } from '../types';

jest.mock('./settings', () => ({
  settings: { distance_unit: 'mi' },
}));

describe('distance', () => {
  //exact
  it('returns 0 for exact location', () => {
    const meeting: Meeting = { slug: '', latitude: 1, longitude: 1 };
    expect(distance(meeting, meeting)).toStrictEqual(0);
  });

  //miles
  it.each`
    a                                    | b                                    | expected
    ${{ latitude: 1, longitude: 1 }}     | ${{ latitude: 2, longitude: 2 }}     | ${97.69}
    ${{ latitude: 10, longitude: 10 }}   | ${{ latitude: 20, longitude: 20 }}   | ${959.82}
    ${{ latitude: 100, longitude: 100 }} | ${{ latitude: 200, longitude: 200 }} | ${7697.83}
  `('miles: yields $expected with $a and $b', ({ a, b, expected }) => {
    expect(distance(a, b)).toStrictEqual(expected);
  });

  //kilometers
  it.each`
    a                                    | b                                    | expected
    ${{ latitude: 1, longitude: 1 }}     | ${{ latitude: 2, longitude: 2 }}     | ${157.22}
    ${{ latitude: 10, longitude: 10 }}   | ${{ latitude: 20, longitude: 20 }}   | ${1544.68}
    ${{ latitude: 100, longitude: 100 }} | ${{ latitude: 200, longitude: 200 }} | ${12388.45}
  `('kilometers: yields $expected with $a and $b', ({ a, b, expected }) => {
    //settings.distance_unit = 'km';
    expect(distance(a, b)).toStrictEqual(expected);
  });

  //null checks
  it.each`
    a                                | b
    ${null}                          | ${null}
    ${{ latitude: 1 }}               | ${null}
    ${{ longitude: 1 }}              | ${null}
    ${{ latitude: 1, longitude: 1 }} | ${null}
    ${null}                          | ${{ latitude: 1 }}
    ${null}                          | ${{ longitude: 1 }}
    ${null}                          | ${{ latitude: 1, longitude: 1 }}
    ${{ latitude: 1 }}               | ${{ latitude: 1 }}
    ${{ latitude: 1, longitude: 1 }} | ${{ latitude: 1 }}
    ${{ latitude: 1 }}               | ${{ latitude: 1, longitude: 1 }}
  `('yields null with $a and $b', ({ a, b }) => {
    expect(distance(a, b)).toStrictEqual(null);
  });
});
