import { settings } from './settings';
import { formatUrl } from './format';

//load input values from query string
export function getQueryString() {
  const input = { ...settings.defaults };

  //load input from query string
  const query = new URLSearchParams(window.location.search);

  //loop through filters
  settings.filters
    .filter(filter => query.has(filter))
    .forEach(filter => {
      input[filter] = query.get(filter).split('/');
    });

  //loop through additional values
  settings.params
    .filter(param => query.has(param))
    .forEach(param => {
      input[param] = query.get(param);
    });

  return input;
}

//save input values to query string
export function setQueryString(input) {
  const url = formatUrl(input);

  //set the query string with the history api
  if (window.location.href !== url) {
    window.history.pushState('', '', url);
  }
}
