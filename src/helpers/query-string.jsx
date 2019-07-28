import qs from 'query-string';
import merge from 'deepmerge';
import { settings } from '../settings';

export function getQueryString(queryString) {
  let input = {
    center: null,
    day: [],
    district: [],
    meeting: null,
    mode: settings.defaults.mode,
    query: null,
    radius: null,
    region: [],
    search: '',
    time: [],
    type: [],
    view: settings.defaults.view,
  };

  //load input from query string
  let querystring = qs.parse(location.search);
  for (let i = 0; i < settings.filters.length; i++) {
    let filter = settings.filters[i];
    if (querystring[filter]) {
      if (filter == 'day' && querystring.day == 'any') {
        input.day = [];
      } else {
        input[filter] = querystring[filter].split('/');
      }
    }
  }
  for (let i = 0; i < settings.params.length; i++) {
    if (querystring[settings.params[i]]) {
      input[settings.params[i]] = querystring[settings.params[i]];
    }
  }
  if (querystring.meeting) {
    input.meeting = querystring.meeting;
  }

  //today mode
  if (!querystring.day && settings.defaults.today) {
    input.day.push(new Date().getDay());
  }

  return input;
}

export function setQueryString(state) {
  let query = {};
  const existingQuery = qs.parse(location.search);

  //filter by region, day, time, and type
  for (let i = 0; i < settings.filters.length; i++) {
    let filter = settings.filters[i];
    if (state.input[filter].length && state.indexes[filter].length) {
      if (filter != 'day') {
        query[filter] = state.input[filter].join('/');
      }
    }
  }

  //decide whether to set day in the query string (todo refactor)
  if (state.input.day.length && state.indexes.day.length) {
    if (
      !settings.defaults.today ||
      existingQuery.search ||
      existingQuery.day ||
      existingQuery.region ||
      existingQuery.district ||
      existingQuery.time ||
      existingQuery.type ||
      state.input.day.length > 1 ||
      state.input.day[0] != new Date().getDay()
    ) {
      query.day = state.input.day.join('/');
    }
  } else if (settings.defaults.today) {
    query.day = 'any';
  }

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
        mode: undefined,
        region: undefined,
        search: undefined,
        meeting: undefined,
        time: undefined,
        type: undefined,
        view: undefined,
      }),
      query
    )
  );

  //un-url-encode the separator
  query = query.split(encodeURIComponent('/')).join('/');

  //set the query string with html5
  window.history.pushState(
    '',
    '',
    query.length ? '?' + query : window.location.pathname
  );
}
