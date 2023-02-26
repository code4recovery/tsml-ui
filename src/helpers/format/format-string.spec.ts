import { formatString } from '.';

describe('formatString', () => {
  it('works with mixed params', () => {
    expect(
      formatString('%string% - %number% - %empty%', {
        string: 'string',
        number: 12,
        empty: undefined,
      })
    ).toStrictEqual('string - 12 - ');
  });
});
