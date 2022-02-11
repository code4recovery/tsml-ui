import { MeetingType } from './MeetingType';

export interface Translation {
  add_to_calendar: string;
  address: string;
  alerts: {
    bad_data: string;
    no_data_src: string;
    no_results: string;
    not_found: string;
  };
  appointment: string;
  back_to_meetings: string;
  contribute_with: string;
  distance: string;
  distance_any: string;
  email_edit_url: string;
  email_public_url: string;
  email_subject: string;
  evening: string;
  feedback: string;
  friday: string;
  get_directions: string;
  in_progress_single: string;
  in_progress_multiple: string;
  location: string;
  location_group: string;
  meeting_information: string;
  meetings: string;
  midday: string;
  midnight: string;
  monday: string;
  morning: string;
  name: string;
  noon: string;
  modes: {
    location: string;
    me: string;
    search: string;
  };
  night: string;
  phone: string;
  region: string;
  region_any: string;
  remove: string;
  saturday: string;
  seventh_tradition: string;
  sunday: string;
  thursday: string;
  time: string;
  time_any: string;
  title: {
    weekday: string;
    time: string;
    type: string;
    meetings: string;
    region: string;
    search_with: string;
    search_near: string;
    distance: string;
  };
  tuesday: string;
  type_any: string;
  type_descriptions: Record<Extract<MeetingType, 'O' | 'C'>, string>;
  types: Record<MeetingType, string>;
  unnamed_meeting: string;
  updated: string;
  views: {
    table: string;
    map: string;
  };
  wednesday: string;
  weekday_any: string;
}
