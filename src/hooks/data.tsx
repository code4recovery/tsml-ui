import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

import { loadMeetingData, translateGoogleSheet } from '../helpers';
import { Index, Meeting } from '../types';
import { useInput } from './input';
import { useSettings } from './settings';

export type Data = {
  capabilities: {
    coordinates: boolean;
    distance: boolean;
    geolocation: boolean;
    inactive: boolean;
    location: boolean;
    region: boolean;
    sharing: boolean;
    time: boolean;
    type: boolean;
    weekday: boolean;
  };
  loading: boolean;
  meetings: { [index: string]: Meeting };
  indexes: {
    distance: Index[];
    region: Index[];
    time: Index[];
    type: Index[];
    weekday: Index[];
  };
};

const defaultData: Data = {
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
  loading: true,
  meetings: {},
  indexes: {
    distance: [],
    region: [],
    time: [],
    type: [],
    weekday: [],
  },
};

const DataContext = createContext<Data & { error?: string }>(defaultData);

export const useData = () => useContext(DataContext);

export const DataProvider = ({
  children,
  google,
  src,
  timezone,
}: PropsWithChildren<{ google?: string; src?: string; timezone?: string }>) => {
  const [error, setError] = useState<string>();
  const [data, setData] = useState<Data>(defaultData);
  const { input } = useInput();
  const { settings, strings } = useSettings();

  useEffect(() => {
    if (!src) {
      setError('Configuration error: a data source must be specified.');
    } else {
      const sheetId = src.startsWith('https://docs.google.com/spreadsheets/d/')
        ? src.split('/')[5]
        : undefined;

      // google sheet
      if (sheetId) {
        if (!google) {
          setError('Configuration error: a Google API key is required.');
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
        .then(json => {
          if (sheetId) {
            json = translateGoogleSheet(json, sheetId, settings);
          }

          if (!Array.isArray(json) || !json.length) {
            return setError(
              'Configuration error: data is not in the correct format.'
            );
          }

          if (timezone) {
            try {
              // check if timezone is valid
              Intl.DateTimeFormat(undefined, { timeZone: timezone });
            } catch (e) {
              return setError(
                `Timezone ${timezone} is not valid. Please use one like Europe/Rome.`
              );
            }
          }

          const [meetings, indexes, capabilities] = loadMeetingData(
            json,
            data.capabilities,
            settings,
            strings,
            timezone
          );

          if (!timezone && !Object.keys(meetings).length) {
            return setError('Configuration error: time zone is not set.');
          }

          setData({ capabilities, indexes, meetings, loading: false });
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
          setError(
            errors[error as keyof typeof errors]
              ? `Error: ${
                  errors[error as keyof typeof errors]
                } (${error}) when ${
                  sheetId ? 'contacting Google' : 'loading data'
                }.`
              : error.toString()
          );
        });
    }
  }, []);

  return (
    <DataContext.Provider value={{ ...data, error }}>
      {children}
    </DataContext.Provider>
  );
};
