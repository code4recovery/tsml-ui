/// <reference path="../../index.d.ts" />
import React, { ReactNode, createContext, useState } from 'react';
import { State } from '../types/State';

import {
  filterMeetingData,
  getQueryString,
  loadMeetingData,
  mergeSettings,
  translateGoogleSheet,
} from '../helpers';
import { useLocation } from 'react-router-dom';
import { Translation } from '../types';

export interface IStateContext {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  google?: string;
  mapbox?: string;
  settings: TSMLReactConfig;
  src?: string;
  timezone?: string;
  strings: Translation;
  filteredSlugs: string[];
  inProgress: string[];
  loadData: () => void;
}

const initialState: State = {
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
};

export const StateContext = createContext<IStateContext | null>(null);

export const StateContextProvider = ({
  children,
  google,
  mapbox,
  settings: userSettings,
  src,
  timezone,
}: {
  children: ReactNode;
  google?: string;
  mapbox?: string;
  settings?: TSMLReactConfig;
  src?: string;
  timezone?: string;
}) => {
  const [state, setState] = useState<State>(initialState);
  const location = useLocation();
  const { settings, strings } = mergeSettings(userSettings);

  // filter data
  const [filteredSlugs, inProgress] = filterMeetingData(
    state,
    setState,
    settings,
    strings,
    mapbox
  );

  // show alert?
  state.alert = !filteredSlugs.length ? strings.no_results : undefined;

  // show error?
  if (state.input.meeting && !state.meetings[state.input.meeting]) {
    state.error = strings.not_found;
  }

  const loadData = () => {
    if (state.loading) {
      console.log(
        'TSML UI meeting finder: https://github.com/code4recovery/tsml-ui'
      );

      const input = getQueryString(settings, location);

      if (!src) {
        setState({
          ...state,
          error: 'Configuration error: a data source must be specified.',
          loading: false,
          ready: true,
        });
      } else {
        const sheetId = src.startsWith(
          'https://docs.google.com/spreadsheets/d/'
        )
          ? src.split('/')[5]
          : undefined;

        // google sheet
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

        // cache busting
        if (src.endsWith('.json') && input.meeting) {
          src = `${src}?${new Date().getTime()}`;
        }

        // fetch json data file and build indexes
        fetch(src)
          .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
          .then(data => {
            if (sheetId) {
              data = translateGoogleSheet(data, sheetId, settings);
            }

            if (!Array.isArray(data) || !data.length) {
              return setState({
                ...state,
                error:
                  'Configuration error: data is not in the correct format.',
                loading: false,
                ready: true,
              });
            }

            const [meetings, indexes, capabilities] = loadMeetingData(
              data,
              state.capabilities,
              settings,
              strings,
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
  };

  return (
    <StateContext.Provider
      value={{
        state,
        setState,
        google,
        mapbox,
        settings,
        src,
        timezone,
        strings,
        filteredSlugs,
        inProgress,
        loadData,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};
