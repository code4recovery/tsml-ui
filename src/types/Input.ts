export type Input = {
  distance: string[];
  latitude?: number;
  longitude?: number;
  meeting?: string;
  mode: 'search' | 'location' | 'me';
  region: string[];
  search?: string;
  time: TSMLReactConfig['times'];
  type: string[];
  view: 'list' | 'map';
  weekday: TSMLReactConfig['weekdays'];
};
