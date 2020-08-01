import qs from 'query-string';

import { settings } from './settings';

//load input values from query string
export function getQueryString() {
  const input = { ...settings.defaults };

  //load input from query string
  const querystring = qs.parse(location.search);

  //loop through filters
  settings.filters
    .filter(filter => querystring[filter])
    .forEach(filter => {
      input[filter] = querystring[filter].split('/');
    });

  //loop through additional values
  settings.params
    .filter(param => querystring[param])
    .forEach(param => {
      input[param] = querystring[param];
    });

  return input;
}

//save input values to query string
export function setQueryString(state) {
  let query = {};
  const existingQuery = qs.parse(location.search);

  //distance, region, time, type, and weekday
  settings.filters
    .filter(filter => state.input[filter].length)
    .forEach(filter => {
      query[filter] = state.input[filter].join('/');
    });

  //meeting, mode, search, view
  settings.params
    .filter(param => state.input[param] != settings.defaults[param])
    .forEach(param => {
      query[param] = state.input[param];
    });

  //create a query string with only values in use
  query = qs.stringify(query);

  //un-url-encode a few things
  query = query
    .replace(/%2F/g, '/')
    .replace(/%20/g, '+')
    .replace(/%2C/g, ',');

  if (location.search.substr(1) != query) {
    //set the query string with html5
    window.history.pushState(
      '',
      '',
      query.length ? '?' + query : window.location.pathname
    );
  }
}
