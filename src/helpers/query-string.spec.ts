import { getQueryString, setQueryString } from './query-string';
import { stringify } from 'querystring';
import { settings } from './settings';
import { formatUrl } from './format';

jest.mock('./settings', () => ({
  settings: { filters: [], params: [] },
}));

jest.mock('./format', () => ({
  formatUrl: jest.fn().mockReturnValue('foo'),
}));

describe('getQueryString', () => {
  it('returns defaults correctly', () => {
    expect(getQueryString()).toStrictEqual({});
  });

  it('reads from url correctly', () => {
    settings.filters.push('region');
    settings.params.push('search');

    const params = { region: ['foo'], search: 'bar' };

    window.location.search = stringify(params);

    expect(getQueryString()).toStrictEqual(params);
  });
});

describe('setQueryString', () => {
  it('calls formatUrl and pushState correctly', () => {
    setQueryString('foo');
    expect(formatUrl).toHaveBeenCalledWith('foo');
    expect(window.history.pushState).toHaveBeenCalledWith('', '', 'foo');
  });
});
