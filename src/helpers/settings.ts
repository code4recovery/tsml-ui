import { createContext, useContext } from 'react';

import merge from 'deepmerge';
import { Settings } from 'luxon';

import { en, es, fr, ja, nl, pt, sk, sv } from '../i18n';

// override these on your page with tsml_react_config
export const defaults: TSMLReactConfig = {
  cache: false,
  calendar_enabled: true,
  columns: ['time', 'distance', 'name', 'location_group', 'address', 'region'],
  conference_providers: {
    'bluejeans.com': 'Bluejeans',
    'discord.gg': 'Discord',
    'freeconference.com': 'Free Conference',
    'freeconferencecall.com': 'FreeConferenceCall',
    'goto.com': 'GoTo',
    'gotomeet.me': 'GoTo',
    'gotomeeting.com': 'GoTo',
    'horizon.meta.com': 'Virtual Reality',
    'maps.secondlife.com': 'Virtual Reality',
    'meet.google.com': 'Google Meet',
    'meet.jit.si': 'Jitsi',
    'meetings.dialpad.com': 'Dialpad',
    'signal.group': 'Signal',
    'skype.com': 'Skype',
    'slurl.com': 'Virtual Reality',
    'teams.live.com': 'Teams',
    'teams.microsoft.com': 'Teams',
    'vrchat.com': 'Virtual Reality',
    'webex.com': 'WebEx',
    'zoho.com': 'Zoho',
    'zoom.us': 'Zoom',
  },
  default_distance: ['5'],
  defaults: {
    distance: [],
    mode: 'search',
    region: [],
    search: '',
    time: [],
    type: [],
    view: 'table',
    weekday: [],
  },
  distance_options: [1, 2, 5, 10, 15, 25, 50, 100],
  distance_unit: 'mi', //mi or km
  duration: 60,
  feedback_emails: [], //email addresses for update meeting info button
  filters: ['region', 'distance', 'weekday', 'time', 'type'],
  in_person_types: [
    'BA',
    'BRK',
    'CAN',
    'CF',
    'AL-AN',
    'AL',
    'FF',
    'OUT',
    'SM',
    'X',
    'XB',
  ],
  language: 'en', // fallback language
  map: {
    markers: {
      geocode: {
        html: `<svg viewBox="-1.1 -1.086 43.182 63.273"><path fill="#2c78b3" stroke="#2c52b3" stroke-width="3" d="M20.5.5c11.046 0 20 8.656 20 19.333 0 10.677-12.059 21.939-20 38.667C14.881 44.067.5 30.511.5 19.833.5 9.156 9.454.5 20.5.5z"/></svg>`,
        height: 38.4,
        width: 26,
      },
      geolocation: {
        html: `<div style="background-color: var(--link); border-radius: 50%; border: 2px solid white; cursor: default; height: 16px; width: 16px;"></div>`,
        height: 16,
        width: 16,
      },
      location: {
        html: `<svg viewBox="-1.1 -1.086 43.182 63.273"><path fill="#f76458" stroke="#b3382c" stroke-width="3" d="M20.5.5c11.046 0 20 8.656 20 19.333 0 10.677-12.059 21.939-20 38.667C14.881 44.067.5 30.511.5 19.833.5 9.156 9.454.5 20.5.5z"/></svg>`,
        height: 38.4,
        width: 26,
      },
    },
    tiles: {
      attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>`,
      url: 'https://{s}s.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    },
  },
  now_offset: -10, // "now" includes meetings that started in the last 10 minutes
  params: ['search', 'mode', 'view', 'meeting'], //input other than filters
  show: {
    controls: true, // whether to show search + dropdowns + list/map
    title: true, // whether to display the title h1
  },
  strings: {
    en,
    es,
    fr,
    ja,
    nl,
    pt,
    sk,
    sv,
  },
  times: ['morning', 'midday', 'evening', 'night', 'appointment'],
  weekdays: [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ],
};

export function mergeSettings(userSettings?: Partial<TSMLReactConfig>) {
  const settings = userSettings ? merge(defaults, userSettings) : defaults;

  // flags can be specified to override the default. also [] means unset
  if (!Array.isArray(settings.flags)) {
    settings.flags = ['M', 'W'];
  }

  // columns can be specified to override the default
  if (userSettings) {
    if (Array.isArray(userSettings.columns)) {
      settings.columns = userSettings.columns;
    }
    if (Array.isArray(userSettings.filters)) {
      settings.filters = userSettings.filters;
    }
    if (Array.isArray(userSettings.params)) {
      settings.params = userSettings.params;
    }
    if (Array.isArray(userSettings.times)) {
      settings.times = userSettings.times;
    }
    if (Array.isArray(userSettings.weekdays)) {
      settings.weekdays = userSettings.weekdays;
    }
  }

  const preferredLanguage = navigator.language.substring(0, 2);

  if (preferredLanguage in settings.strings) {
    settings.language = preferredLanguage as Lang;
  }

  const strings = settings.strings[settings.language];

  Settings.defaultLocale = navigator.language;

  return { settings, strings };
}

export const SettingsContext = createContext<{
  settings: TSMLReactConfig;
  strings: Translation;
}>({ settings: defaults, strings: en });

export const useSettings = () => useContext(SettingsContext);
