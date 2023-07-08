import { formatUrl } from './format-url';
import type { State } from '../types';

//load input values from query string
export function getQueryString(settings: TSMLReactConfig): State['input'] {
  const input = { ...settings.defaults };

  //load input from query string
  const query = new URLSearchParams(window.location.search);

  //loop through filters
  settings.filters
    .filter(filter => query.has(filter))
    .forEach(filter => {
      //@ts-expect-error TODO
      input[filter] = query.get(filter).split('/');
    });

  //loop through additional values
  settings.params
    .filter(param => query.has(param))
    .forEach(param => {
      //@ts-expect-error TODO
      input[param] = query.get(param);
    });

  //temporary band-aid to support weekday=0 URLs
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

//save input values to query string
export function setQueryString(
  input: Partial<TSMLReactConfig['defaults']>,
  settings: TSMLReactConfig
) {
  const url = formatUrl(input, settings);

  //set the query string with the history api
  if (window.location.href !== url) {
    window.history.pushState('', '', url);
  }
}
