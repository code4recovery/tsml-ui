import { createContext, useContext } from 'react';
import merge from 'deepmerge';
import { Settings } from 'luxon';

import { en, es, fr, ja, sv } from '../i18n';

//override these on your page with tsml_react_config
export const defaults: TSMLReactConfig = {
  cache: false,
  columns: ['time', 'distance', 'name', 'location_group', 'address', 'region'],
  conference_providers: {
    'bluejeans.com': 'Bluejeans',
    'discord.gg': 'Discord',
    'freeconference.com': 'Free Conference',
    'freeconferencecall.com': 'FreeConferenceCall',
    'goto.com': 'GoTo',
    'gotomeet.me': 'GoTo',
    'gotomeeting.com': 'GoTo',
    'meet.google.com': 'Google Hangouts',
    'meet.jit.si': 'Jitsi',
    'meetings.dialpad.com': 'Dialpad',
    'skype.com': 'Skype',
    'webex.com': 'WebEx',
    'zoho.com': 'Zoho',
    'zoom.us': 'Zoom',
  },
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
  distance_options: [1, 2, 5, 10, 15, 25],
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
  language: 'en', //fallback language
  map: {
    markers: {
      location: {
        backgroundImage: `url(data:image/svg+xml;base64,${window.btoa(
          '<svg viewBox="-1.1 -1.086 43.182 63.273" xmlns="http://www.w3.org/2000/svg"><path fill="#f76458" stroke="#b3382c" stroke-width="3" d="M20.5,0.5 c11.046,0,20,8.656,20,19.333c0,10.677-12.059,21.939-20,38.667c-5.619-14.433-20-27.989-20-38.667C0.5,9.156,9.454,0.5,20.5,0.5z"/></svg>'
        )})`,
        cursor: 'pointer',
        height: 38.4,
        width: 26,
      },
    },
    style: 'mapbox://styles/mapbox/streets-v9',
  },
  now_offset: -10, //"now" includes meetings that started in the last 10 minutes
  params: ['search', 'mode', 'view', 'meeting'], //input other than filters
  show: {
    controls: true, //whether to show search + dropdowns + list/map
    listButtons: false, //show conference buttons in list or show labels
    title: true, //whether to display the title h1
  },
  strings: {
    en,
    es,
    fr,
    ja,
    sv,
  },
  times: ['morning', 'midday', 'evening', 'night'],
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

export function mergeSettings(userSettings?: TSMLReactConfig) {
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
    if (Array.isArray(userSettings.weekdays)) {
      settings.weekdays = userSettings.weekdays;
    }
  }

  const preferredLanguage = navigator.language.substring(0, 2) as Lang;

  const language = Object.keys(settings.strings).includes(preferredLanguage)
    ? preferredLanguage
    : settings.language;

  const strings = settings.strings[language];

  Settings.defaultLocale = language;

  return { settings, strings };
}

export const SettingsContext = createContext<{
  settings: TSMLReactConfig;
  strings: Translation;
}>({ settings: defaults, strings: en });

export const useSettings = () => useContext(SettingsContext);
