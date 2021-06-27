import merge from 'deepmerge';

import en from '../i18n/en';
import es from '../i18n/es';
import fr from '../i18n/fr';

//override these on your page with tsml_react_config
const defaults = {
  conference_providers: {
    'bluejeans.com': 'Bluejeans',
    'freeconference.com': 'Free Conference',
    'freeconferencecall.com': 'FreeConferenceCall',
    'meet.google.com': 'Google Hangouts',
    'gotomeet.me': 'GoToMeeting',
    'gotomeeting.com': 'GoToMeeting',
    'meet.jit.si': 'Jitsi Meet',
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
  feedback_emails: [], //email addresses for update meeting info button
  filters: ['region', 'distance', 'weekday', 'time', 'type'],
  filter_special_types: ['active', 'in-person', 'online'],
  flags: ['M', 'W'],
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
  now_offset: -10, //"now" includes meetings that started in the last 10 minutes
  params: ['search', 'mode', 'view', 'meeting', 'debug'], //input other than filters
  show: {
    controls: true, //whether to show search + dropdowns + list/map
    inactive: true, //whether to show inactive meetings at all
    listButtons: false, //show conference buttons in list or show labels
    title: true, //whether to display the title h1
  },
  strings: {
    en: en,
    es: es,
    fr: fr,
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

const settings =
  typeof tsml_react_config === 'object'
    ? merge(defaults, tsml_react_config)
    : defaults;

const preferredLanguage = navigator.language.substr(0, 2);

const language = Object.keys(settings.strings).includes(preferredLanguage)
  ? preferredLanguage
  : settings.language;

const strings = settings.strings[language];

export { settings, strings };
