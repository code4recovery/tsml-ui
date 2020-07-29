import merge from 'deepmerge';

import en from '../i18n/en';
import es from '../i18n/es';
import fr from '../i18n/fr';

//override these on your page with window.config
export const settings = merge(
  {
    columns: ['time', 'distance', 'name', 'location', 'address', 'region'], //can be reordered
    conference_providers: {
      'bluejeans.com': 'Bluejeans',
      'freeconference.com': 'Free Conference',
      'freeconferencecall.com': 'FreeConferenceCall',
      'meet.google.com': 'Google Hangouts',
      'gotomeet.me': 'GoToMeeting',
      'gotomeeting.com': 'GoToMeeting',
      'skype.com': 'Skype',
      'webex.com': 'WebEx',
      'zoho.com': 'Zoho',
      'zoom.us': 'Zoom',
    },
    defaults: {
      distance: [],
      meeting: null,
      mode: 'search', //start in keyword search mode (options are search, location, me),
      region: [],
      search: '',
      time: [],
      type: [],
      view: 'list', //start in list or map view,
      weekday: [],
    },
    distance_options: [1, 2, 5, 10, 25],
    distance_unit: 'mi', // "mi" or "km"
    filters: ['region', 'distance', 'weekday', 'time', 'type'],
    flags: window.config?.flags ? [] : ['Men', 'Women'],
    keys: {
      mapbox: null, //enable mapbox maps
    },
    language: 'en', //fallback language
    mapbox_style: 'mapbox://styles/mapbox/streets-v9',
    marker_style: {
      backgroundImage:
        'url(data:image/svg+xml;base64,' +
        window.btoa(
          '<?xml version="1.0" encoding="utf-8"?><svg viewBox="-1.1 -1.086 43.182 63.273" xmlns="http://www.w3.org/2000/svg"><path fill="#f76458" stroke="#b3382c" stroke-width="3" d="M20.5,0.5 c11.046,0,20,8.656,20,19.333c0,10.677-12.059,21.939-20,38.667c-5.619-14.433-20-27.989-20-38.667C0.5,9.156,9.454,0.5,20.5,0.5z"/></svg>'
        ) +
        ')',
      cursor: 'pointer',
      height: 38.4,
      width: 26,
    },
    modes: ['search'], //"location" and "me" will be appended if capable
    params: ['search', 'mode', 'view', 'meeting'], //utility array
    strings: {
      en: en,
      es: es,
      fr: fr,
    },
    times: ['morning', 'midday', 'evening', 'night'],
    timezone: 'America/New_York',
    title: true, //whether to display the title h1
    weekdays: [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ],
  },
  window.config || {}
);

const preferredLanguage = navigator.language.substr(0, 2);

const useLanguage = Object.keys(settings.strings).includes(preferredLanguage)
  ? preferredLanguage
  : settings.language;

export const strings = settings.strings[useLanguage];
