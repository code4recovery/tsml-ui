import merge from 'deepmerge';

import en from '../i18n/en';
import es from '../i18n/es';
import fr from '../i18n/fr';

//override these on your page with tsml_react_config
export const settings = merge(
  {
    columns: ['time', 'distance', 'name', 'location', 'address', 'region'],
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
      //default input
      distance: [],
      meeting: null,
      mode: 'search',
      region: [],
      search: '',
      time: [],
      type: [],
      view: 'list',
      weekday: [],
    },
    distance_options: [1, 2, 5, 10, 25],
    distance_unit: 'mi', //mi or km
    filters: ['region', 'distance', 'weekday', 'time', 'type'],
    flags: tsml_react_config?.flags ? [] : ['Men', 'Women'],
    language: 'en', //fallback language
    map: {
      key: null, //access token
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
    modes: ['search'], //location and me will be appended if capable
    now_offset: -10, //"now" includes meetings that started in the last 10 minutes
    params: ['search', 'mode', 'view', 'meeting', 'meeting_name'], //input other than filters
    search: 'default', //one of 'default', 'quoted' or 'or'
    show: {
      cityAsRegionFallback: true, //whether to use city if region is empty and city is not
      controls: true, //whether to show search + dropdowns + list/map
      listButtons: false, //show conference buttons in list or show labels
      title: true, //whether to display the title h1
      warnings: false, //console.warn for bad data
    },
    strings: {
      en: en,
      es: es,
      fr: fr,
    },
    times: ['morning', 'midday', 'evening', 'night'],
    timezone: 'America/New_York',
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
  tsml_react_config || {}
);

const preferredLanguage = navigator.language.substr(0, 2);

const useLanguage = Object.keys(settings.strings).includes(preferredLanguage)
  ? preferredLanguage
  : settings.language;

export const strings = settings.strings[useLanguage];
