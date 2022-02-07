type Translation = import('./src/types/Translation').Translation;
type MeetingType = import('./src/types/MeetingType').MeetingType;

type Lang = 'en' | 'es' | 'fr';

interface TSMLReactConfig {
  cache: boolean;
  columns: Array<
    'time' | 'distance' | 'name' | 'location_group' | 'address' | 'region'
  >;
  timezone: string;
  conference_providers: Record<string, string>;
  defaults: {
    // TODO: Not sure about this types
    distance: unknown[];
    meeting: string | null;
    mode: 'search' | 'location';
    region: string[];
    search: string;
    time: TSMLReactConfig['times'];
    type: MeetingType[];
    view: 'table' | 'map';
    weekday: TSMLReactConfig['weekdays'];
  };
  distance_unit: 'mi' | 'km';
  /** Email addresses for update meeting info button */
  feedback_emails: string[];
  filters: Array<'region' | 'distance' | 'weekday' | 'time' | 'type'>;
  flags: Array<'M' | 'W'> | undefined | null;
  in_person_types: MeetingType[];
  language: Lang;
  map: {
    markers: {
      location: {
        backgroundImage: string;
        cursor: string;
        height: number;
        width: number;
      };
    };
    style: string;
  };
  /** What meetings to show based off a past start time in minutes */
  now_offset: number;
  /** Input other than filters */
  params: Array<'search' | 'mode' | 'view' | 'meeting'>;
  show: {
    /** Whether to show search + dropdowns + list/map */
    controls: boolean;
    /** Show conference buttons in list or show labels */
    listButtons: boolean;
    /** Whether to display the title h1 */
    title: boolean;
  };
  strings: {
    [lang in Lang]: Translation;
  };
  times: Array<'morning' | 'midday' | 'evening' | 'night'>;
  weekdays: Array<
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
  >;
}

declare var tsml_react_config: Readonly<TSMLReactConfig> | undefined;

//google analytics globals
declare var gtag:
  | ((
      type: 'event',
      action: string,
      params: {
        event_category: string;
        event_label: string;
      }
    ) => void)
  | undefined;

declare var ga:
  | ((
      type: 'send',
      params: {
        hitType: 'event';
        eventCategory: string;
        eventAction: string;
        eventLabel: string;
      }
    ) => void)
  | undefined;

//declaration merge for IE compat
interface Navigator {
  msSaveBlob: (blob: Blob, name: string) => void;
}
