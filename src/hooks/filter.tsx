import { DateTime } from 'luxon';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  calculateDistances,
  getIndexByKey,
  formatString as i18n,
} from '../helpers';
import { Meeting } from '../types';
import { useData } from './data';
import { useInput } from './input';
import { useSettings } from './settings';

const FilterContext = createContext<{
  alert?: string;
  latitude?: number;
  longitude?: number;
  filteredSlugs: string[];
  inProgress: string[];
  meeting?: Meeting;
}>({
  filteredSlugs: [],
  inProgress: [],
});

export const FilterProvider = ({ children }: PropsWithChildren) => {
  const [alert, setAlert] = useState<string>();
  const [filter, setFilter] = useState<{
    filteredSlugs: string[];
    inProgress: string[];
    meeting?: Meeting;
  }>({
    filteredSlugs: [],
    inProgress: [],
  });
  const [coordinates, setCoordinates] = useState<{
    latitude?: number;
    longitude?: number;
    waiting: boolean;
  }>({ waiting: false });
  const { settings, strings } = useSettings();
  const { capabilities, indexes, meetings } = useData();
  const input = useInput();

  useEffect(() => {
    const matchGroups: string[][] = [];
    const now = DateTime.now();
    const now_offset = now.plus({ minute: settings.now_offset });
    const slugs = Object.keys(meetings);
    const timeDiff: { [index: string]: number } = {};

    //filter by distance, region, time, type, and weekday
    settings.filters.forEach(filter => {
      if (input[filter]?.length && capabilities[filter]) {
        if (filter === 'type') {
          //get the intersection of types (Open AND Discussion)
          input['type'].forEach(type =>
            matchGroups.push(getIndexByKey(indexes[filter], type)?.slugs ?? [])
          );
        } else {
          //get the union of other filters (Monday OR Tuesday)
          matchGroups.push(
            [].concat.apply(
              [],
              // @ts-expect-error TODO
              input[filter].map(
                key => getIndexByKey(indexes[filter], key)?.slugs ?? []
              )
            )
          );
        }
      }
    });

    //handle keyword search or geolocation
    if (input.mode === 'search') {
      if (input.search) {
        const orTerms = input.search
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          .replaceAll(' OR ', '|')
          .toLowerCase()
          .split('|')
          .map(phrase => phrase.split('"'))
          .map(phrase => [
            ...new Set(
              phrase
                .filter((_e, index) => index % 2)
                .concat(
                  phrase
                    .filter((_e, index) => !(index % 2))
                    .join(' ')
                    .split(' ')
                )
                .filter(e => e)
            ),
          ])
          .filter(e => e.length);
        const matches = slugs.filter(slug =>
          orTerms.some(andTerm =>
            andTerm.every(term => meetings[slug].search?.search(term) !== -1)
          )
        );
        // @ts-expect-error TODO
        matchGroups.push([].concat.apply([], matches));
      }
    } else if (['me', 'location'].includes(input.mode)) {
      //only show meetings with physical locations
      matchGroups.push(
        slugs.filter(slug => meetings[slug].latitude && meetings[slug].latitude)
      );

      if (!coordinates.latitude || !coordinates.longitude) {
        if (input.mode === 'location' && input.search && coordinates.waiting) {
          const url =
            window.location.host === 'tsml-ui.test'
              ? 'geo.test'
              : 'geo.code4recovery.org';
          fetch(
            `https://${url}/api/geocode?${new URLSearchParams({
              application: 'tsml-ui',
              language: settings.language,
              referrer: window.location.href,
              search: input.search,
            })}`
          )
            .then(result => result.json())
            .then(({ results }) => {
              if (results?.length) {
                calculateDistances({
                  latitude: results[0].geometry.location.lat,
                  longitude: results[0].geometry.location.lng,
                  setCoordinates,
                  settings,
                  slugs,
                  strings,
                });
              } else {
                setCoordinates({
                  latitude: undefined,
                  longitude: undefined,
                  waiting: false,
                });
                setAlert(
                  i18n(strings.errors.geocoding, {
                    address: input.search,
                  })
                );
              }
            });
        } else if (input.mode === 'me' && coordinates.waiting) {
          navigator.geolocation.getCurrentPosition(
            position => {
              calculateDistances({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                setCoordinates,
                settings,
                slugs,
                strings,
              });
            },
            error => {
              console.warn(`TSML UI geolocation error: ${error.message}`);
              // setState(state => ({
              //   ...state,
              //   error: strings.errors.geolocation,
              //   filtering: false,
              // }));
            },
            { timeout: 5000 }
          );
        }
      }
    }

    //do the filtering, if necessary
    const filteredSlugs = matchGroups.length
      ? // @ts-expect-error TODO
        matchGroups.shift().filter(v => matchGroups.every(a => a.includes(v))) //get intersection of slug arrays
      : slugs; //get everything

    //build lookup for meeting times based on now
    slugs.forEach(slug => {
      timeDiff[slug] =
        meetings[slug].start?.diff(now, 'minutes').minutes ?? -9999;
      //if time is earlier than X minutes ago, increment diff by a week
      if (timeDiff[slug] < settings.now_offset) {
        timeDiff[slug] += 10080;
      }
    });

    //sort slugs
    filteredSlugs.sort((a, b) => {
      const meetingA = meetings[a];
      const meetingB = meetings[b];

      //sort appointment meetings to the end
      if (meetingA.start && !meetingB.start) return -1;
      if (!meetingA.start && meetingB.start) return 1;

      //sort by time
      if (!input.weekday.length) {
        if (timeDiff[a] !== timeDiff[b]) {
          return timeDiff[a] - timeDiff[b];
        }
      } else {
        if (meetingA.minutes_week !== meetingB.minutes_week) {
          if (!meetingA.minutes_week) return -1;
          if (!meetingB.minutes_week) return 1;
          return meetingA.minutes_week - meetingB.minutes_week;
        }
      }

      //then by distance
      if (meetingA.distance !== meetingB.distance) {
        if (!meetingA.distance) return -1;
        if (!meetingB.distance) return 1;
        return meetingA.distance - meetingB.distance;
      }

      //then by meeting name
      if (meetingA.name !== meetingB.name) {
        if (!meetingA.name) return -1;
        if (!meetingB.name) return 1;
        return meetingA.name.localeCompare(meetingB.name);
      }

      //then by location name
      if (meetingA.location !== meetingB.location) {
        if (!meetingA.location) return -1;
        if (!meetingB.location) return 1;
        return meetingA.location.localeCompare(meetingB.location);
      }

      return 0;
    });

    //find in-progress meetings
    const inProgress = input.weekday?.length
      ? []
      : filteredSlugs.filter(slug => {
          const { start, end, types } = meetings[slug];
          if (!start || !end) return false;
          return (
            start < now_offset && end > now && !types?.includes('inactive')
          );
        });

    const meeting =
      input.meeting && input.meeting in meetings
        ? meetings[input.meeting]
        : undefined;

    setFilter({ filteredSlugs, inProgress, meeting });
  }, [meetings, input]);

  return (
    <FilterContext.Provider value={{ ...filter, ...coordinates, alert }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => useContext(FilterContext);
