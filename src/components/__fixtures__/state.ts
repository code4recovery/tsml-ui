import type { State } from '../../types';

export const mockState: State = {
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
    distance: [],
    region: [],
    time: [],
    type: [],
    weekday: [],
    mode: 'search',
    view: 'table',
  },
  loading: false,
  meetings: {},
  ready: true,
};
