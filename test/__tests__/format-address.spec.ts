import { formatAddress } from '../../src/helpers/format-address';

describe('formatAddress', () => {
  it('returns first part of address if USA address', () => {
    expect(formatAddress('123 Main St, Buffalo, NY 12345, USA')).toStrictEqual(
      '123 Main St'
    );
  });

  it('returns first part of address in Australia', () => {
    expect(
      formatAddress('123 Main St, Melbourne VIC 1234, Australia')
    ).toStrictEqual('123 Main St');
  });
});
