import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  getDistance,
  isGoogleSheetData,
  loadMeetingData,
  translateGoogleSheet,
} from '../helpers';
import { Index, JSONData, Meeting } from '../types';
import { useError } from './error';
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

const DataContext = createContext<Data>(defaultData);

export const useData = () => useContext(DataContext);

export const DataProvider = ({
  children,
  google,
  src,
  timezone,
}: PropsWithChildren<{ google?: string; src?: string; timezone?: string }>) => {
  const [data, setData] = useState<Data>(defaultData);
  const { setError } = useError();
  const { input, latitude, longitude } = useInput();
  const { settings, strings } = useSettings();

  useEffect(() => {
    if (timezone) {
      try {
        // check if timezone is valid
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
      } catch (e) {
        throw new Error(
          `Timezone ${timezone} is not valid. Please use one like Europe/Rome.`
        );
      }
    }

    const sources = src?.split(',').filter(Boolean) || [];

    if (!sources.length) {
      throw new Error('Configuration error: a data source must be specified.');
    }

    const sheets: (string | undefined)[] = [];

    Promise.all(
      sources.map(src => {
        const sheetId = src.startsWith(
          'https://docs.google.com/spreadsheets/d/'
        )
          ? src.split('/')[5]
          : undefined;
        sheets.push(sheetId);

        // google sheet
        if (sheetId) {
          if (!google) {
            throw new Error(
              'Configuration error: a Google API key is required.'
            );
          }
          src = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:ZZ?key=${google}`;
        }

        // cache busting
        if (src.endsWith('.json') && input.meeting) {
          src = `${src}?${new Date().getTime()}`;
        }

        return fetch(src);
      })
    )
      .then(responses =>
        Promise.all(
          responses.map(res =>
            res.ok ? res.json() : Promise.reject(res.status)
          )
        )
      )
      .then((responses: JSONData[][]) => {
        const json = responses
          .map((json, index) => {
            const sheetId = sheets[index];
            return isGoogleSheetData(json) && sheetId
              ? translateGoogleSheet(json, sheetId, settings)
              : json;
          })
          .flat();

        if (!Array.isArray(json) || !json.length) {
          throw new Error(
            'Configuration error: data is not in the correct format.'
          );
        }

        const [meetings, indexes, capabilities] = loadMeetingData(
          json,
          data.capabilities,
          settings,
          strings,
          timezone
        );

        if (!timezone && !Object.keys(meetings).length) {
          throw new Error('Configuration error: time zone is not set.');
        }

        setData({ capabilities, indexes, meetings, loading: false });
      })
      .catch(error => setError(String(error)));
  }, []);

  // calculate distance if coordinates are available
  useEffect(() => {
    if (!latitude || !longitude || !data.meetings || data.loading) return;

    const distances = Object.fromEntries(
      settings.distance_options.map(option => [option, []])
    );

    Object.keys(data.meetings).forEach(slug => {
      const meeting = data.meetings[slug];
      if (meeting.latitude && meeting.longitude) {
        meeting.distance = getDistance(
          { latitude, longitude },
          meeting,
          settings
        );
      }

      for (const option of settings.distance_options) {
        if (meeting.distance && meeting.distance <= option) {
          (distances[option] as string[]).push(meeting.slug);
        }
      }

      data.meetings[slug] = meeting;
    });

    const distance: Index[] = Object.entries(distances).map(([key, slugs]) => ({
      key,
      name: `${key} ${settings.distance_unit}`,
      slugs,
    }));

    setData(prevData => ({
      ...prevData,
      capabilities: {
        ...prevData.capabilities,
        distance: true,
      },
      indexes: {
        ...prevData.indexes,
        distance,
      },
      meetings: data.meetings,
    }));
  }, [latitude, longitude, data.meetings, settings.distance_unit]);

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
};
