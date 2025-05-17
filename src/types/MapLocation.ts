import type { Meeting } from './Meeting';

export type MapLocation = {
  directions_url: string;
  formatted_address: string;
  key: string;
  latitude: number;
  longitude: number;
  meetings: Meeting[];
  name?: string;
};
