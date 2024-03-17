import { createContext, PropsWithChildren, useContext } from 'react';

import { useSearchParams } from 'react-router-dom';

import { Input, State } from '../types';

import { getQueryString } from './query-string';
import { defaults, useSettings } from './settings';

type DataContextType = {
  capabilities: State['capabilities'];
  indexes: State['indexes'];
  input: Input;
  meetings: State['meetings'];
};

const DataContext = createContext<DataContextType>({
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
  input: {
    mode: defaults.defaults.mode,
    search: '',
    view: defaults.defaults.view,
    distance: [],
    time: [],
    type: [],
    weekday: [],
    region: [],
  },
  meetings: {},
});

export const useData = () => useContext(DataContext);

export const DataProvider = ({
  capabilities,
  children,
  indexes,
  meetings,
}: PropsWithChildren & DataContextType) => {
  const [searchParams] = useSearchParams();
  const { settings } = useSettings();
  const input = getQueryString(searchParams, settings);

  return (
    <DataContext.Provider value={{ capabilities, indexes, input, meetings }}>
      {children}
    </DataContext.Provider>
  );
};
