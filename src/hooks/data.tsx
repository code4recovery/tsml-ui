import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useParams } from 'react-router-dom';

import {
  isGoogleSheetData,
  loadMeetingData,
  translateGoogleSheet,
} from '../helpers';
import { Index, JSONData, Meeting } from '../types';
import { useError } from './error';
import { useLocation } from './location';
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
  indexes: {
    distance: Index[];
    region: Index[];
    time: Index[];
    type: Index[];
    weekday: Index[];
  };
  meetings: { [index: string]: Meeting };
  slugs: string[];
  waitingForData: boolean;
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
  indexes: {
    distance: [],
    region: [],
    time: [],
    type: [],
    weekday: [],
  },
  meetings: {},
  slugs: [],
  waitingForData: true,
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
  const { slug } = useParams();
  const { setBounds, calculateDistances } = useLocation();
  const { settings, strings } = useSettings();

  useEffect(() => {
    if (timezone) {
      try {
        // check if timezone is valid
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
      } catch (e) {
        throw new Error(
          `Timezone ${timezone} is not valid. Please use one like America/New_York.`
        );
      }
    }

    const sources = src?.split(',').filter(Boolean) || [];

    if (!sources.length) {
      throw new Error('a data source must be specified');
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
            throw new Error('a Google API key is required');
          }
          src = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:ZZ?key=${google}`;
        }

        // cache busting
        if (src.endsWith('.json') && slug) {
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
          throw new Error('data is not in the correct format');
        }

        const { bounds, capabilities, indexes, meetings, slugs } =
          loadMeetingData(json, data.capabilities, settings, strings, timezone);

        if (!timezone && !slugs.length) {
          throw new Error('time zone is not set');
        }

        if (bounds) {
          setBounds(bounds);
        }

        setData({
          capabilities,
          indexes,
          meetings,
          slugs,
          waitingForData: false,
        });
      })
      .catch(error => {
        setError(`Loading error: ${error}`);
        setData(prevData => ({ ...prevData, waitingForData: false }));
      });
  }, []);

  // Update data when location changes to recalculate distances
  useEffect(() => {
    if (data.waitingForData || !Object.keys(data.meetings).length) {
      return;
    }

    const {
      meetings: meetingsWithDistances,
      distanceIndex,
      hasDistance,
    } = calculateDistances(data.meetings);

    setData(prevData => ({
      ...prevData,
      capabilities: {
        ...prevData.capabilities,
        distance: hasDistance,
      },
      indexes: {
        ...prevData.indexes,
        distance: distanceIndex,
      },
      meetings: meetingsWithDistances,
    }));
  }, [calculateDistances, data.waitingForData]);

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
};
