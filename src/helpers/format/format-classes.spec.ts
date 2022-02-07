import { formatClasses } from './format-classes';

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
