import { formatArray } from '../../src/helpers/format-array';

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
