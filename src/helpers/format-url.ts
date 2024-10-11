import { Settings } from '../types';

// format an internal link with correct query params
export function formatUrl(
  input: Partial<Settings['defaults']>,
  settings: Settings
) {
  const query: { [id: string]: string } = {};

  // distance, region, time, type, and weekday
  settings.filters
    .filter(filter => typeof input[filter] !== 'undefined')
    .filter(filter => input[filter]?.length)
    .forEach(filter => {
      // todo make less ugly
      const value = input[filter]?.join('/');
      if (filter && value) {
        query[filter] = value;
      }
    });

  // meeting, mode, search, view
  settings.params
    .filter(param => typeof input[param] !== 'undefined')
    .filter(param => input[param] !== settings.defaults[param])
    .forEach(param => {
      if (input[param]) {
        query[param] = input[param];
      }
    });

  // create a query string with only values in use
  const queryString = new URLSearchParams(query)
    .toString()
    .replace(/%2F/g, '/')
    .replace(/%20/g, '+')
    .replace(/%2C/g, ',');

  const [path] = window.location.href.split('?');

  return `${path}${queryString.length ? `?${queryString}` : ''}`;
}
