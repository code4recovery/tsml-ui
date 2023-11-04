import { getQueryString, setQueryString } from '../../src/helpers/query-string';
import { stringify } from 'querystring';
import { formatUrl } from '../../src/helpers/format-url';
import { defaults } from '../../src/helpers/settings';

jest.mock('../../src/helpers/format-url', () => ({
  formatUrl: jest.fn().mockReturnValue('foo'),
}));

describe('getQueryString', () => {
  it('returns defaults correctly', () => {
    expect(getQueryString(defaults)).toStrictEqual(defaults.defaults);
  });

  it('reads from url correctly', () => {
    defaults.filters.push('region');
    defaults.params.push('search');

    const params = { region: ['foo'], search: 'bar' };

    window.location.search = stringify(params);

    expect(getQueryString(defaults)).toStrictEqual({
      ...defaults.defaults,
      ...params,
    });
  });
});

describe('setQueryString', () => {
  it('calls formatUrl and pushState correctly', () => {
    const params = { search: 'foo' };
    setQueryString(params, defaults);

    expect(formatUrl).toHaveBeenCalledWith(params, defaults);
    expect(window.history.pushState).toHaveBeenCalledWith('', '', 'foo');
  });
});
