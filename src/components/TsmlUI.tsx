import { useEffect, useMemo, useRef, useState } from 'react';

import { Global } from '@emotion/react';
import { useSearchParams } from 'react-router-dom';

import {
  filterMeetingData,
  getQueryString,
  loadMeetingData,
  mergeSettings,
  SettingsContext,
  translateGoogleSheet,
} from '../helpers';
import { globalCss } from '../styles';

import { Alert, Controls, Loading, Map, Meeting, Table, Title } from './';

import type { State } from '../types';

export default function TsmlUI({
  google,
  settings: userSettings,
  src,
  timezone,
}: {
  google?: string;
  settings?: TSMLReactConfig;
  src?: string;
  timezone?: string;
}) {
  const [occludedHeight, setOccludedHeight] = useState(0);
  const { settings, strings } = mergeSettings(userSettings);
  const [searchParams] = useSearchParams();
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
    filtering: true,
    input: settings.defaults,
    indexes: {
      distance: [],
      region: [],
      time: [],
      type: [],
      weekday: [],
    },
    loading: true,
    meetings: {},
  });

  //   // update canonical
  //   let canonical = document.querySelector('link[rel="canonical"]');
  //   if (!canonical) {
  //     canonical = document.createElement('link');
  //     canonical.setAttribute('rel', 'canonical');
  //     document.getElementsByTagName('head')[0]?.appendChild(canonical);
  //   }
  //   canonical.setAttribute(
  //     'href',
  //     formatUrl(
  //       state.input.meeting ? { meeting: state.input.meeting } : state.input,
  //       settings
  //     )
  //   );

  // update input when search params change
  useEffect(() => {
    const input = getQueryString(settings);
    if (input !== state.input) {
      setState(state => ({
        ...state,
        input: {
          ...input,
          latitude: state.input.latitude,
          longitude: state.input.longitude,
        },
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    // load data once
    if (state.loading) {
      console.log(
        'TSML UI meeting finder: https://github.com/code4recovery/tsml-ui'
      );

      const input = getQueryString(settings);

      if (!src) {
        setState(state => ({
          ...state,
          error: 'Configuration error: a data source must be specified.',
          filtering: false,
          loading: false,
        }));
      } else {
        const sheetId = src.startsWith(
          'https://docs.google.com/spreadsheets/d/'
        )
          ? src.split('/')[5]
          : undefined;

        // google sheet
        if (sheetId) {
          if (!google) {
            setState(state => ({
              ...state,
              error: 'Configuration error: a Google API key is required.',
              filtering: false,
              loading: false,
            }));
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
              return setState(state => ({
                ...state,
                error:
                  'Configuration error: data is not in the correct format.',
                filtering: false,
                loading: false,
              }));
            }

            if (timezone) {
              try {
                // check if timezone is valid
                Intl.DateTimeFormat(undefined, { timeZone: timezone });
              } catch (e) {
                return setState(state => ({
                  ...state,
                  error: `Timezone ${timezone} is not valid. Please use one like Europe/Rome.`,
                  filtering: false,
                  loading: false,
                }));
              }
            }

            const [meetings, indexes, capabilities] = loadMeetingData(
              data,
              state.capabilities,
              settings,
              strings,
              timezone
            );

            if (!timezone && !Object.keys(meetings).length) {
              return setState(state => ({
                ...state,
                error: 'Configuration error: time zone is not set.',
                filtering: false,
                loading: false,
              }));
            }

            const waitingForGeo =
              (!input.latitude || !input.longitude) &&
              ((input.mode === 'location' && input.search) ||
                input.mode === 'me');

            setState(state => ({
              ...state,
              capabilities,
              filtering: !!waitingForGeo,
              indexes,
              input,
              loading: false,
              meetings,
            }));
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
            setState(state => ({
              ...state,
              error: errors[error as keyof typeof errors]
                ? `Error: ${
                    errors[error as keyof typeof errors]
                  } (${error}) when ${
                    sheetId ? 'contacting Google' : 'loading data'
                  }.`
                : error.toString(),
              filtering: false,
              loading: false,
            }));
          });
      }
    }

    // measure area covered up by fixed elements
    window.addEventListener('resize', debouncedGetOccludedHeight);
    window.addEventListener('scroll', debouncedGetOccludedHeight);
    getOccludedHeight();

    // manage classes
    document.body.classList.add('tsml-ui');
    return () => {
      window.removeEventListener('resize', debouncedGetOccludedHeight);
      window.removeEventListener('scroll', debouncedGetOccludedHeight);
      document.body.classList.remove('tsml-ui');
    };
  }, []);

  const getOccludedHeight = () => {
    const elements = document.body.getElementsByTagName('*');
    let occludedHeight = 0;
    for (const element of elements) {
      const style = window.getComputedStyle(element);
      if (
        style.position === 'fixed' &&
        parseFloat(style.width) === window.innerWidth
      ) {
        occludedHeight += parseFloat(style.height);
      }
    }
    setOccludedHeight(occludedHeight);
  };

  const timeoutId = useRef<ReturnType<typeof setTimeout>>();

  const debouncedGetOccludedHeight = () => {
    clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(getOccludedHeight, 250);
  };

  // filter data
  const [filteredSlugs, inProgress] = useMemo(
    () => filterMeetingData(state, setState, settings, strings),
    [state.loading, state.filtering, JSON.stringify(state.input)]
  );

  // show alert?
  state.alert = !filteredSlugs.length ? strings.no_results : undefined;

  // show error?
  if (state.input.meeting && !state.meetings[state.input.meeting]) {
    state.error = strings.not_found;
  }

  return (
    <div style={{ minHeight: `calc(100dvh - ${occludedHeight}px)` }}>
      <SettingsContext.Provider value={{ settings, strings }}>
        <Global styles={globalCss} />
        {state.loading ? (
          <Loading />
        ) : state.input.meeting && state.input.meeting in state.meetings ? (
          <Meeting setState={setState} state={state} />
        ) : (
          <>
            {settings.show.title && <Title state={state} />}
            {settings.show.controls && (
              <Controls state={state} setState={setState} />
            )}
            {(state.alert || state.error) && <Alert state={state} />}
            {state.filtering ? (
              <Loading />
            ) : state.input.view === 'table' ? (
              <Table
                filteredSlugs={filteredSlugs}
                inProgress={inProgress}
                setState={setState}
                state={state}
              />
            ) : (
              <div style={{ display: 'flex', flexGrow: 1 }}>
                <Map
                  filteredSlugs={filteredSlugs}
                  listMeetingsInPopup={true}
                  setState={setState}
                  state={state}
                />
              </div>
            )}
          </>
        )}
      </SettingsContext.Provider>
    </div>
  );
}
