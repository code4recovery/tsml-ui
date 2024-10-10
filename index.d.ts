/* eslint-disable no-unused-vars */

type Translation = import('./src/types/Translation').Translation;
type Lang = import('@code4recovery/spec').Language;

interface TSMLReactConfig {
  cache: boolean;
  calendar_enabled: boolean;
  columns: string[];
  conference_providers: Record<string, string>;
  defaults: {
    distance: string[];
    meeting?: string;
    mode: 'search' | 'location' | 'me';
    region: string[];
    search: string;
    time: TSMLReactConfig['times'];
    type: string[];
    view: 'table' | 'map';
    weekday: TSMLReactConfig['weekdays'];
  };
  distance_options: number[];
  distance_unit: 'mi' | 'km';
  duration: number;
  feedback_emails: string[];
  filters: Array<'region' | 'distance' | 'weekday' | 'time' | 'type'>;
  flags?: string[];
  in_person_types: string[];
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
  now_offset: number;
  params: Array<'search' | 'mode' | 'view' | 'meeting'>;
  show: {
    controls: boolean;
    title: boolean;
  };
  strings: {
    [lang in Lang]: Translation;
  };
  times: Array<'morning' | 'midday' | 'evening' | 'night'>;
  weekdays: string[];
}

declare const tsml_react_config: TSMLReactConfig | undefined;

//google analytics globals
declare const gtag:
  | ((
      type: 'event',
      action: string,
      params: {
        event_category: string;
        event_label: string;
      }
    ) => void)
  | undefined;

declare const ga:
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
