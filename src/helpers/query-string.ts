import type { State } from '../types';

// load input values from query string
export function getQueryString(
  query: URLSearchParams,
  settings: TSMLReactConfig
): State['input'] {
  const input = { ...settings.defaults };

  // loop through filters
  settings.filters
    .filter(filter => query.has(filter))
    .forEach(filter => {
      // @ts-expect-error TODO
      input[filter] = query.get(filter).split('/');
    });

  // loop through additional values
  settings.params
    .filter(param => query.has(param))
    .forEach(param => {
      // @ts-expect-error TODO
      input[param] = query.get(param);
    });

  // temporary band-aid to support weekday=0 URLs
  if (input.weekday) {
    input.weekday = input.weekday.map(day =>
      ['0', '1', '2', '3', '4', '5', '6'].includes(day)
        ? settings.weekdays[parseInt(day)]
        : day
    );
  }

  return {
    ...settings.defaults,
    ...input,
  };
}
