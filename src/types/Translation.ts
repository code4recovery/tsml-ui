import { MeetingType } from './MeetingType';

export interface Translation {
  add_to_calendar: string;
  address: string;
  appointment: string;
  back_to_meetings: string;
  contact_call: string;
  contact_email: string;
  contribute_with: string;
  days: {
    friday: string;
    monday: string;
    saturday: string;
    sunday: string;
    thursday: string;
    tuesday: string;
    wednesday: string;
  };
  distance: string;
  distance_any: string;
  email_edit_url: string;
  email_public_url: string;
  email_subject: string;
  evening: string;
  feedback: string;
  get_directions: string;
  in_progress_single: string;
  in_progress_multiple: string;
  location: string;
  location_group: string;
  match_single: string;
  match_multiple: string;
  meeting_information: string;
  meetings: string;
  midday: string;
  midnight: string;
  morning: string;
  name: string;
  no_results: string;
  noon: string;
  not_found: string;
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
  seventh_tradition: string;
  share: string;
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
  type_any: string;
  type_descriptions: Record<Extract<MeetingType, 'O' | 'C'>, string>;
  types: Record<MeetingType, string>;
  unnamed_meeting: string;
  updated: string;
  views: {
    table: string;
    map: string;
  };
  weekday_any: string;
}
