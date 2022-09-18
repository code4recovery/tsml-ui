import { formatAddress } from './format-address';

describe('formatAddress', () => {
  it('returns first part of address if length > 3', () => {
    expect(formatAddress('foo, bar, baz, qux')).toStrictEqual('foo');
  });

  it.each([undefined, 'foo, bar, baz'])('yields null with %s', input => {
    expect(formatAddress(input)).toStrictEqual(null);
  });
});
