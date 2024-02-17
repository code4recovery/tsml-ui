import { stringify } from 'querystring';

import { getQueryString } from '../../src/helpers/query-string';
import { defaults } from '../../src/helpers/settings';

describe('getQueryString', () => {
  it('returns defaults correctly', () => {
    expect(getQueryString(new URLSearchParams(), defaults)).toStrictEqual(
      defaults.defaults
    );
  });

  it('reads from url correctly', () => {
    defaults.filters.push('region');
    defaults.params.push('search');

    const params = { region: ['foo'], search: 'bar' };

    window.location.search = stringify(params);

    expect(getQueryString(new URLSearchParams(), defaults)).toStrictEqual({
      ...defaults.defaults,
      ...params,
    });
  });
});
