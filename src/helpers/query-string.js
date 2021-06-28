import { settings } from './settings';

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
  const query = {};

  //distance, region, time, type, and weekday
  settings.filters
    .filter(filter => input[filter]?.length)
    .forEach(filter => {
      query[filter] = input[filter].join('/');
    });

  //meeting, mode, search, view
  settings.params
    .filter(param => input[param] !== settings.defaults[param])
    .forEach(param => {
      query[param] = input[param];
    });

  //create a query string with only values in use
  const queryString = new URLSearchParams(query)
    .toString()
    .replace(/%2F/g, '/')
    .replace(/%20/g, '+')
    .replace(/%2C/g, ',');

  //set the query string with the history api
  if (window.location.search.substr(1) != queryString) {
    window.history.pushState(
      '',
      '',
      queryString.length ? '?' + queryString : window.location.pathname
    );
  }
}
