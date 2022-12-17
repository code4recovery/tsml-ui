import { settings } from './settings';
import { formatUrl } from './format';
import type { State } from '../types';

//load input values from query string
export function getQueryString(): State['input'] {
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
    input.weekday = input.weekday.map(day => {
      //@ts-expect-error todo
      if (day === '0') return settings.weekdays[0];
      //@ts-expect-error todo
      if (day === '1') return settings.weekdays[1];
      //@ts-expect-error todo
      if (day === '2') return settings.weekdays[2];
      //@ts-expect-error todo
      if (day === '3') return settings.weekdays[3];
      //@ts-expect-error todo
      if (day === '4') return settings.weekdays[4];
      //@ts-expect-error todo
      if (day === '5') return settings.weekdays[5];
      //@ts-expect-error todo
      if (day === '6') return settings.weekdays[6];
      return day;
    });
  }

  return {
    ...settings.defaults,
    ...input,
  };
}

//save input values to query string
export function setQueryString(input: Partial<TSMLReactConfig['defaults']>) {
  const url = formatUrl(input);

  //set the query string with the history api
  if (window.location.href !== url) {
    window.history.pushState('', '', url);
  }
}
