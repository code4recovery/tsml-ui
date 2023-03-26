import React, { useEffect, useState } from 'react';

import '../../public/style.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { State } from '../types';
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

type TsmlUIProps = {
  google?: string;
  mapbox?: string;
  src?: string;
  timezone?: string;
};

export default function TsmlUI({ google, mapbox, src, timezone }: TsmlUIProps) {
  const [state, setState] = useState<State>({
    capabilities: {
      coordinates: false,
      distance: false,
      geolocation: false,
      inactive: false,
      location: false,
      region: false,
      sharing: false,
      time: false,
      type: false,
      weekday: false,
    },
    input: {
      distance: [],
      mode: 'search',
      region: [],
      time: [],
      type: [],
      view: 'table',
      weekday: [],
    },
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
      setState({ ...state, input: getQueryString() });
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

  //load data once
  if (state.loading) {
    console.log(
      'TSML UI meeting finder: https://github.com/code4recovery/tsml-ui'
    );

    const input = getQueryString();

    if (!src) {
      setState({
        ...state,
        error: 'Configuration error: a data source must be specified.',
        loading: false,
        ready: true,
      });
    } else {
      const sheetId = src.startsWith('https://docs.google.com/spreadsheets/d/')
        ? src.split('/')[5]
        : undefined;

      //google sheet
      if (sheetId) {
        if (!google) {
          setState({
            ...state,
            error: 'Configuration error: a Google API key is required.',
            loading: false,
          });
        }
        src = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:ZZ?key=${google}`;
      }

      //cache busting
      if (src.endsWith('.json')) {
        src = `${src}?${new Date().getTime()}`;
      }

      //fetch json data file and build indexes
      fetch(src)
        .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
        .then(data => {
          if (sheetId) {
            data = translateGoogleSheet(data, sheetId);
          }

          if (!Array.isArray(data) || !data.length) {
            return setState({
              ...state,
              error: 'Configuration error: data is not in the correct format.',
              loading: false,
              ready: true,
            });
          }

          const [meetings, indexes, capabilities] = loadMeetingData(
            data,
            state.capabilities,
            timezone
          );

          if (!timezone && !Object.keys(meetings).length) {
            return setState({
              ...state,
              error: 'Configuration error: time zone is not set.',
              loading: false,
              ready: true,
            });
          }

          const waitingForGeo =
            (!input.latitude || !input.longitude) &&
            ((input.mode === 'location' && input.search) ||
              input.mode === 'me');

          setState({
            ...state,
            capabilities,
            indexes,
            input,
            loading: false,
            meetings,
            ready: !waitingForGeo,
          });
        })
        .catch(error => {
          const errors = {
            400: 'bad request',
            401: 'unauthorized',
            403: 'forbidden',
            404: 'not found',
            429: 'too many requests',
            500: 'internal server',
            502: 'bad gateway',
            503: 'service unavailable',
            504: 'gateway timeout',
          };
          setState({
            ...state,
            error: errors[error as keyof typeof errors]
              ? `Error: ${
                  errors[error as keyof typeof errors]
                } (${error}) when ${
                  sheetId ? 'contacting Google' : 'loading data'
                }.`
              : error.toString(),
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
  state.alert = !filteredSlugs.length ? strings.no_results : undefined;

  //show error?
  if (state.input.meeting && !state.meetings[state.input.meeting]) {
    state.error = strings.not_found;
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
          <div className="d-flex flex-column flex-grow-1 gap-3">
            {settings.show.title && <Title state={state} />}
            {settings.show.controls && (
              <Controls state={state} setState={setState} mapbox={mapbox} />
            )}
            {(state.alert || state.error) && (
              <Alert state={state} setState={setState} />
            )}
            {filteredSlugs && state.input.view === 'table' && (
              <Table
                filteredSlugs={filteredSlugs}
                inProgress={inProgress}
                listButtons={settings.show.listButtons}
                setState={setState}
                state={state}
              />
            )}
            {filteredSlugs && state.input.view === 'map' && (
              <Map
                filteredSlugs={filteredSlugs}
                listMeetingsInPopup={true}
                mapbox={mapbox}
                setState={setState}
                state={state}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
