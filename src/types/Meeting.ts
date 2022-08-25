import type { Moment } from 'moment-timezone';
import type { Timezone } from './Timezone';

type Day = '0' | '1' | '2' | '3' | '4' | '5' | '6';

export interface Meeting {
  address?: string;
  approximate?: boolean;
  conference_phone?: string;
  conference_phone_notes?: string;
  conference_provider?: string;
  conference_url?: string;
  conference_url_notes?: string;
  day?: Day | Day[];
  distance?: number;
  edit_url?: string | null;
  email?: string;
  end?: Moment;
  end_time?: `${number}:${number}`;
  feedback_url?: string;
  formatted_address?: string;
  group?: string;
  isActive?: boolean;
  isInPerson?: boolean;
  isOnline?: boolean;
  isTempClosed?: boolean;
  latitude?: number;
  location?: string;
  location_notes?: string;
  longitude?: number;
  minutes_week?: number;
  name?: string;
  notes?: string;
  region?: string;
  regions?: string[];
  search?: string;
  slug: string;
  start?: Moment;
  time?: `${number}:${number}`;
  timezone?: Timezone;
  types?: MeetingType[];
  updated?: string;
  venmo?: string;
  website?: string;
}
