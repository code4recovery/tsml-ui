import type { Meeting } from './Meeting';

export type Index = {
  key: string;
  name: string;
  slugs: string[];
  children?: Index[];
};

export type State = {
  alert?: string;
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
  error?: string;
  indexes: {
    distance: Index[];
    region: Index[];
    time: Index[];
    type: Index[];
    weekday: Index[];
  };
  input: {
    distance: string[];
    latitude?: number;
    longitude?: number;
    meeting?: string;
    mode: 'search' | 'location' | 'me';
    region: string[];
    search?: string;
    time: TSMLReactConfig['times'];
    type: string[];
    view: 'table' | 'map';
    weekday: TSMLReactConfig['weekdays'];
  };
  loading: boolean;
  meetings: {
    [index: string]: Meeting;
  };
  ready: boolean;
};
