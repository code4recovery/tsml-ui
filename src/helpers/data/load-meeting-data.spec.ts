import type { JSONData } from '../../types';
import { flattenDays } from './load-meeting-data';

test('flattenDays', () => {
  const input: Array<Partial<JSONData>> = [
    { slug: 'bar', day: '0' },
    { slug: 'foo', day: ['0', '1'] },
  ];

  const expected: Array<Partial<JSONData>> = [
    { slug: 'bar', day: 0 },
    { slug: 'foo-0', day: 0 },
    { slug: 'foo-1', day: 1 },
  ];

  expect(flattenDays(input)).toStrictEqual(expected);
});
