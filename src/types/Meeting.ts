import type { Moment } from 'moment-timezone';
import type { Timezone } from './Timezone';

type Day = '0' | '1' | '2' | '3' | '4' | '5' | '6';

export interface Meeting {
  address: string | null;
  approximate: boolean;
  conference_phone: string;
  conference_phone_notes: string;
  conference_provider: string | null;
  conference_url: string;
  conference_url_notes: string;
  day: Day | Day[];
  edit_url: `row ${number}`;
  email: string;
  end: Moment;
  end_time: `${number}:${number}`;
  feedback_url: string;
  formatted_address: string;
  group: string;
  isActive: boolean;
  isInPerson: boolean;
  isOnline: boolean;
  isTempClosed: boolean;
  latitude: number | null;
  location: string;
  location_notes?: string;
  longitude: number | null;
  minutes_now: number;
  minutes_week: number;
  name: string;
  notes?: string;
  region: string;
  regions: string[];
  search: string;
  slug: string;
  start: Moment;
  time: `${number}:${number}`;
  timezone: Timezone;
  types: MeetingType[];
  updated: string;
  venmo: string;
  website: string;
}
