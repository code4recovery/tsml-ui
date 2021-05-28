import React, { useEffect, useState } from 'react';

import '../../public/style.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import { Alert, Controls, Loading, Map, Meeting, Table, Title } from './';

import {
  filterMeetingData,
  getQueryString,
  loadMeetingData,
  translateGoogleSheet,
  translateNoCodeAPI,
  setQueryString,
  settings,
} from '../helpers';

export default function TsmlUI({ json, mapbox }) {
  const [state, setState] = useState({
    alert: null,
    capabilities: {
      coordinates: false,
      distance: false,
      geolocation: false,
      inactive: false,
      map: false,
      region: false,
      time: false,
      type: false,
      weekday: false,
    },
    error: null,
    input: getQueryString(location.search),
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

  //enable forward & back buttons
  useEffect(() => {
    const popstateListener = () => {
      setState({ ...state, input: getQueryString(location.search) });
    };
    window.addEventListener('popstate', popstateListener);
    return () => {
      window.removeEventListener('popstate', popstateListener);
    };
  }, []);

  //load data once from json
  if (state.loading) {
    settings.map.key = mapbox;

    //fetch json data file and build indexes
    fetch(json)
      .then(result => result.json())
      .then(
        result => {
          //checks if src is google sheet and translates it if so
          if (json.includes('spreadsheets.google.com')) {
            result = translateGoogleSheet(result);
          } else if (json.includes('nocodeapi.com')) {
            result = translateNoCodeAPI(result);
          }

          const [meetings, indexes, capabilities] = loadMeetingData(
            result,
            state.capabilities
          );

          setState({
            ...state,
            capabilities: capabilities,
            indexes: indexes,
            meetings: meetings,
            loading: false,
          });
        },
        error => {
          console.error('JSON fetch error: ' + error);
          setState({
            ...state,
            error: json ? 'bad_data' : 'no_data',
            loading: false,
          });
        }
      );
    return (
      <div id="tsml-ui">
        <Loading />
      </div>
    );
  }

  //apply input changes to query string
  setQueryString(state.input);

  //filter data
  const filteredSlugs = filterMeetingData(state, setState);

  //show alert?
  state.alert = filteredSlugs.length ? null : 'no_results';

  return (
    <div id="tsml-ui">
      <div className="container-fluid d-flex flex-column py-3">
        {state.input.meeting ? (
          <Meeting state={state} setState={setState} />
        ) : (
          <>
            {settings.show.title && <Title state={state} />}
            {settings.show.controls && (
              <Controls state={state} setState={setState} />
            )}
            <Alert alert={state.alert} error={state.error} />
            {filteredSlugs && state.input.view === 'list' && (
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
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
