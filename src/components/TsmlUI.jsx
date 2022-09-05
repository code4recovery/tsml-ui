import React, { useEffect, useState } from 'react';

import '../../public/style.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import { Alert, Controls, Loading, Map, Meeting, Table, Title } from './';

import {
  filterMeetingData,
  formatUrl,
  getQueryString,
  loadMeetingData,
  setQueryString,
  settings,
  strings,
  translateGoogleSheet,
} from '../helpers';

export default function TsmlUI({ json, mapbox, google, timezone }) {
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
    meetings: {},
    ready: false,
  });

  //enable forward & back buttons
  useEffect(() => {
    const popstateListener = () => {
      setState({ ...state, input: getQueryString(window.location.search) });
    };
    window.addEventListener('popstate', popstateListener);

    //update canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.getElementsByTagName('head')[0]?.appendChild(canonical);
    }
    canonical.setAttribute(
      'href',
      formatUrl(
        state.input.meeting ? { meeting: state.input.meeting } : state.input
      )
    );

    return () => {
      window.removeEventListener('popstate', popstateListener);
    };
  }, [state, window.location.search]);

  //manage classes
  useEffect(() => {
    document.body.classList.add('tsml-ui');
    return () => {
      document.body.classList.remove('tsml-ui');
    };
  }, []);

  //load data once from json
  if (state.loading) {
    console.log(
      'TSML UI meeting finder: https://github.com/code4recovery/tsml-ui'
    );

    const input = getQueryString();

    if (!json) {
      setState({
        ...state,
        error: 'no_data_src',
        loading: false,
        ready: true,
      });
    } else {
      const sheetId = json.startsWith('https://docs.google.com/spreadsheets/d/')
        ? json.split('/')[5]
        : undefined;

      //google sheet
      if (sheetId) {
        if (!google) {
          setState({
            ...state,
            error: 'google_key',
            loading: false,
          });
        }
        json = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:ZZ?key=${google}`;
      }

      //cache busting
      if (json.endsWith('.json') && input.meeting) {
        json = `${json}?${new Date().getTime()}`;
      }

      //fetch json data file and build indexes
      fetch(json)
        .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
        .then(data => {
          if (sheetId) {
            data = translateGoogleSheet(data, sheetId);
          }

          if (!Array.isArray(data) || !data.length) {
            return setState({
              ...state,
              error: 'bad_data',
              loading: false,
              ready: true,
            });
          }

          const [meetings, indexes, capabilities] = loadMeetingData(
            data,
            state.capabilities,
            timezone
          );

          const waitingForGeo =
            (!input.latitude || !input.longitude) &&
            ((input.mode === 'location' && input.search) ||
              input.mode === 'me');

          setState({
            ...state,
            capabilities: capabilities,
            indexes: indexes,
            input: input,
            loading: false,
            meetings: meetings,
            ready: !waitingForGeo,
          });
        })
        .catch(error => {
          console.error(error);
          if (error.toString().includes('NetworkError')) {
            error = 'network_error';
          }
          setState({
            ...state,
            error: strings.alerts[error] ? error : 'bad_data',
            loading: false,
            ready: true,
          });
        });
    }
  }

  //apply input changes to query string
  setQueryString(state.input);

  //filter data
  const [filteredSlugs, inProgress] = filterMeetingData(
    state,
    setState,
    mapbox
  );

  //show alert?
  state.alert = !filteredSlugs.length ? 'no_results' : null;

  //show error?
  if (state.input.meeting && !(state.input.meeting in state.meetings)) {
    state.error = 'not_found';
  }

  return !state.ready ? (
    <div className="tsml-ui">
      <Loading />
    </div>
  ) : (
    <div className="tsml-ui">
      <div className="container-fluid d-flex flex-column py-3">
        {state.input.meeting && state.input.meeting in state.meetings ? (
          <Meeting
            state={state}
            setState={setState}
            mapbox={mapbox}
            feedback_emails={settings.feedback_emails}
          />
        ) : (
          <>
            {settings.show.title && <Title state={state} />}
            {settings.show.controls && (
              <Controls state={state} setState={setState} mapbox={mapbox} />
            )}
            {(state.alert || state.error) && (
              <Alert state={state} setState={setState} />
            )}
            {filteredSlugs && state.input.view === 'table' && (
              <Table
                state={state}
                setState={setState}
                filteredSlugs={filteredSlugs}
                inProgress={inProgress}
                listButtons={settings.show.listButtons}
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
