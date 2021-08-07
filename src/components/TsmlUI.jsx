import React, { useEffect, useState } from 'react';

import '../../public/style.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import { Alert, Controls, Loading, Map, Meeting, Table, Title } from './';

import {
  filterMeetingData,
  getCache,
  getQueryString,
  loadMeetingData,
  setCache,
  setMinutesNow,
  translateGoogleSheet,
  translateNoCodeAPI,
  setQueryString,
  settings,
} from '../helpers';

export default function TsmlUI({ json, mapbox, timezone }) {
  const [state, setState] = useState({
    alert: null,
    capabilities: {
      coordinates: false,
      distance: false,
      geolocation: false,
      inactive: false,
      location: false,
      region: false,
      time: false,
      type: false,
      weekday: false,
    },
    error: null,
    input: {},
    indexes: {
      distance: [],
      region: [],
      time: [],
      type: [],
      weekday: [],
    },
    loading: true,
    meetings: [],
  });

  //used for versioning cache
  const version = '1.1.9';

  //enable forward & back buttons
  useEffect(() => {
    const popstateListener = () => {
      setState({ ...state, input: getQueryString(window.location.search) });
    };
    window.addEventListener('popstate', popstateListener);
    return () => {
      window.removeEventListener('popstate', popstateListener);
    };
  }, [state, window.location.search]);

  //load data once from json
  if (state.loading) {
    const input = getQueryString();
    const cache = getCache(json, version);

    if (cache && !input.debug) {
      setState({
        ...state,
        capabilities: cache.capabilities,
        indexes: cache.indexes,
        input: input,
        loading: false,
        meetings: cache.meetings,
      });
    } else {
      //fetch json data file and build indexes
      fetch(json)
        .then(result => result.json())
        .then(
          result => {
            //checks if src is google sheet and translates it if so
            if (json.includes('spreadsheets.google.com')) {
              result = translateGoogleSheet(result, json);
            } else if (json.includes('nocodeapi.com')) {
              result = translateNoCodeAPI(result);
            }

            const [meetings, indexes, capabilities] = loadMeetingData(
              result,
              state.capabilities,
              input.debug,
              timezone
            );

            setCache(json, version, meetings, indexes, capabilities);

            setState({
              ...state,
              capabilities: capabilities,
              indexes: indexes,
              meetings: meetings,
              loading: false,
              input: input,
            });
          },
          error => {
            console.error(`JSON ${error}`);
            setState({
              ...state,
              error: json ? 'bad_data' : 'no_data',
              input: input,
              loading: false,
            });
          }
        );
    }

    return (
      <div className="tsml-ui">
        <Loading />
      </div>
    );
  }

  //apply input changes to query string
  setQueryString(state.input);

  //update time for sorting
  state.meetings = setMinutesNow(state.meetings);

  //filter data
  const filteredSlugs = filterMeetingData(state, setState, mapbox);

  //show alert?
  state.alert = !filteredSlugs.length ? 'no_results' : null;

  //show error?
  if (state.input.meeting && !(state.input.meeting in state.meetings)) {
    state.error = 'not_found';
  }

  return (
    <div className="tsml-ui">
      <div className="container-fluid d-flex flex-column py-3">
        {state.input.meeting && state.input.meeting in state.meetings ? (
          <Meeting state={state} setState={setState} mapbox={mapbox} />
        ) : (
          <>
            {settings.show.title && <Title state={state} />}
            {settings.show.controls && (
              <Controls state={state} setState={setState} mapbox={mapbox} />
            )}
            <Alert alert={state.alert} error={state.error} />
            {filteredSlugs && state.input.view === 'table' && (
              <Table
                state={state}
                setState={setState}
                filteredSlugs={filteredSlugs}
              />
            )}
            {filteredSlugs && state.input.view === 'map' && (
              <Map
                state={state}
                setState={setState}
                filteredSlugs={filteredSlugs}
                mapbox={mapbox}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
