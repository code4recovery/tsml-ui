import type { Meeting } from '../../types/Meeting';
import type { Timezone } from '../../types/Timezone';
import { checkTimezone, flattenDays } from './load-meeting-data';

test('checkTimezone', () => {
  const realTz: Timezone = 'America/New_York';

  expect(checkTimezone('foo', 'bar')).toStrictEqual('bar');
  expect(checkTimezone(realTz, 'bar')).toStrictEqual(realTz);
});

test('flattenDays', () => {
  const input: Array<Partial<Meeting>> = [
    { slug: 'bar', day: '0' },
    { slug: 'foo', day: ['0', '1'] },
  ];

  const expected: Array<Partial<Meeting>> = [
    { slug: 'bar', day: '0' },
    { slug: 'foo-0', day: '0' },
    { slug: 'foo-1', day: '1' },
  ];

  expect(flattenDays(input)).toStrictEqual(expected);
});
