import type { Language } from '@code4recovery/spec';

import type { Translation } from './Translation';

export type Settings = {
  calendar_enabled: boolean;
  columns: string[];
  conference_providers: Record<string, string>;
  defaults: {
    distance: string[];
    meeting?: string;
    mode: 'search' | 'location' | 'me';
    region: string[];
    search: string;
    time: Settings['times'];
    type: string[];
    view: 'table' | 'map';
    weekday: Settings['weekdays'];
  };
  distance_options: number[];
  distance_unit: 'mi' | 'km';
  duration: number;
  feedback_emails: string[];
  filters: Array<'region' | 'distance' | 'weekday' | 'time' | 'type'>;
  flags?: string[];
  in_person_types: string[];
  language: Language;
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
    [lang in Language]: Translation;
  };
  times: Array<'morning' | 'midday' | 'evening' | 'night'>;
  weekdays: string[];
};
