type Translation = import('./src/types/Translation').Translation;
type Lang = import('@code4recovery/spec').Language;
type MapMarker = {
  html: string;
  height: number;
  width: number;
};
type Mode = 'search' | 'location' | 'me';
type View = 'table' | 'map';

interface TSMLReactConfig {
  cache: boolean;
  calendar_enabled: boolean;
  columns: string[];
  conference_providers: Record<string, string>;
  defaults: {
    distance?: number;
    meeting?: string;
    mode: Mode;
    region: string[];
    search: string;
    time: TSMLReactConfig['times'];
    type: string[];
    view: View;
    weekday: TSMLReactConfig['weekdays'];
  };
  distance_default: number;
  distance_options: number[];
  distance_unit: 'mi' | 'km';
  duration: number;
  feedback_emails: string[];
  filters: Array<'region' | 'weekday' | 'time' | 'type'>;
  flags?: string[];
  hashRouting?: boolean;
  in_person_types: string[];
  language: Lang;
  map: {
    markers: {
      geocode: MapMarker;
      geolocation: MapMarker;
      location: MapMarker;
    };
    tiles: {
      attribution: string;
      url: string;
    };
    tiles_dark?: {
      attribution: string;
      url: string;
    };
  };
  modes: Array<Mode>;
  now_offset: number;
  params: Array<'search' | 'mode' | 'view' | 'meeting'>;
  show: {
    controls: boolean;
    title: boolean;
  };
  strings: {
    [lang in Lang]: Translation;
  };
  times: Array<'morning' | 'midday' | 'evening' | 'night' | 'appointment'>;
  views: Array<View>;
  weekdays: string[];
}

declare var tsml_react_config: TSMLReactConfig | undefined;

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
