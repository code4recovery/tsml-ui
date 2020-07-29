import qs from 'query-string';
import merge from 'deepmerge';

import { settings } from './settings';

const separator = '/'; //used to separate multiple query string values (eg day=0/1)

export function getQueryString() {
  const input = {
    day: [],
    distance: [],
    district: [],
    meeting: null,
    mode: settings.defaults.mode,
    query: null,
    region: [],
    search: '',
    time: [],
    type: [],
    view: settings.defaults.view,
  };

  //load input from query string
  const querystring = qs.parse(location.search);

  //loop through filters
  settings.filters
    .filter(filter => querystring[filter])
    .forEach(filter => {
      input[filter] = querystring[filter].split(separator);
    });

  //loop through additional values
  settings.params
    .filter(param => querystring[param])
    .forEach(param => {
      input[param] = querystring[param];
    });

  return input;
}

export function setQueryString(state) {
  let query = {};
  const existingQuery = qs.parse(location.search);

  //filter by region, day, time, and type
  settings.filters
    .filter(filter => state.input[filter].length)
    .forEach(filter => {
      query[filter] = state.input[filter].join(separator);
    });

  //keyword search
  if (state.input.search.length) {
    query['search'] = state.input.search;
  }

  //set mode property
  if (state.input.mode != settings.defaults.mode) {
    query.mode = state.input.mode;
  }

  //set map property if set
  if (state.input.view != settings.defaults.view) {
    query.view = state.input.view;
  }

  //set inside page property if set
  if (state.input.meeting) query.meeting = state.input.meeting;

  //create a query string with only values in use
  query = qs.stringify(
    merge(
      merge(existingQuery, {
        day: undefined,
        distance: undefined,
        meeting: undefined,
        mode: undefined,
        region: undefined,
        search: undefined,
        time: undefined,
        type: undefined,
        view: undefined,
      }),
      query
    )
  );

  //un-url-encode the separator
  query = query.split(encodeURIComponent(separator)).join(separator);

  if (location.search.substr(1) != query) {
    //set the query string with html5
    window.history.pushState(
      '',
      '',
      query.length ? '?' + query : window.location.pathname
    );
  }
}
