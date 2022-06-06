import type { Meeting } from './Meeting';

export type Index = {
  key: string;
  name: string;
  slugs: string[];
  children: Index[];
};

export type State = {
  alert?: 'no_results' | 'not_found';
  capabilities: {
    coordinates: boolean;
    distance: boolean;
    geolocation: boolean;
    region: boolean;
    time: boolean;
    type: boolean;
    weekday: boolean;
  };
  error?: 'bad_data' | 'no_data_src';
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
    mode: 'search' | 'location' | 'me';
    region: string[];
    search?: string;
    time: TSMLReactConfig['times'];
    type: MeetingType[];
    view: 'table' | 'map';
    weekday: TSMLReactConfig['weekdays'];
  };
  meetings: {
    [index: string]: Meeting;
  };
};
