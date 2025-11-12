import { DateTime } from 'luxon';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';

import { getDistance, getIndexByKey } from '../helpers';
import { Meeting } from '../types';
import { useData } from './data';
import { useInput } from './input';
import { useLocation } from './location';
import { useSettings } from './settings';

const FilterContext = createContext<{
  alert?: string;
  filteredSlugs: string[];
  inProgress: string[];
  meeting?: Meeting;
  waitingForFilter: boolean;
}>({
  filteredSlugs: [],
  inProgress: [],
  waitingForFilter: false,
});

export const FilterProvider = ({ children }: PropsWithChildren) => {
  const [alert, setAlert] = useState<string>();
  const [filter, setFilter] = useState<{
    filteredSlugs: string[];
    inProgress: string[];
    meeting?: Meeting;
    waitingForFilter: boolean;
  }>({
    filteredSlugs: [],
    inProgress: [],
    waitingForFilter: true,
  });
  const { capabilities, indexes, meetings, slugs, waitingForData } = useData();
  const { input } = useInput();
  const { latitude, longitude, waitingForLocation } = useLocation();
  const { settings, strings } = useSettings();
  const { slug } = useParams();

  useEffect(() => {
    if (waitingForData || waitingForLocation) return;

    setFilter({
      filteredSlugs: [],
      inProgress: [],
      meeting: undefined,
      waitingForFilter: true,
    });

    const matchGroups: string[][] = [];
    const now = DateTime.now();
    const now_offset = now.plus({ minute: settings.now_offset });
    const timeDiff: { [index: string]: number } = {};

    // filter by distance, region, time, type, and weekday
    settings.filters.forEach(filter => {
      if (input[filter]?.length && capabilities[filter]) {
        if (filter === 'type') {
          // get the intersection of types (Open AND Discussion)
          input['type'].forEach(type =>
            matchGroups.push(getIndexByKey(indexes[filter], type)?.slugs ?? [])
          );
        } else {
          // get the union of other filters (Monday OR Tuesday)
          matchGroups.push(
            input[filter].flatMap(
              key => getIndexByKey(indexes[filter], key)?.slugs ?? []
            )
          );
        }
      }
    });

    // handle keyword search or geolocation
    if (input.mode === 'search') {
      if (input.search) {
        const orTerms = input.search
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
        matchGroups.push(matches);
      }
    } else if (['me', 'location'].includes(input.mode)) {
      // only show meetings with physical locations
      matchGroups.push(
        slugs.filter(slug => meetings[slug].latitude && meetings[slug].latitude)
      );

      if (input.distance && latitude && longitude) {
        // filter by distance
        matchGroups.push(
          slugs.filter(slug => {
            const meeting = meetings[slug];
            if (!meeting.latitude || !meeting.longitude) return false;
            const distance = getDistance(
              { latitude, longitude },
              meeting,
              settings
            );
            if (distance === undefined) return false;
            return (
              distance <= input.distance! &&
              meeting.latitude !== latitude &&
              meeting.longitude !== longitude
            );
          })
        );
      }
    }

    // do the filtering, if necessary
    const filteredSlugs = matchGroups.length
      ? matchGroups.reduce((acc, cur) => acc.filter(item => cur.includes(item)))
      : slugs;

    // build lookup for meeting times based on now
    slugs.forEach(slug => {
      timeDiff[slug] =
        meetings[slug].start?.diff(now, 'minutes').minutes ?? -9999;
      // if time is earlier than X minutes ago, increment diff by a week
      if (timeDiff[slug] < settings.now_offset) {
        timeDiff[slug] += 10080;
      }
    });

    // sort slugs
    filteredSlugs.sort((a, b) => {
      const meetingA = meetings[a];
      const meetingB = meetings[b];

      // sort appointment meetings to the end
      if (meetingA.start && !meetingB.start) return -1;
      if (!meetingA.start && meetingB.start) return 1;

      // sort by time
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

      // then by distance
      if (meetingA.distance !== meetingB.distance) {
        if (!meetingA.distance) return -1;
        if (!meetingB.distance) return 1;
        return meetingA.distance - meetingB.distance;
      }

      // then by meeting name
      if (meetingA.name !== meetingB.name) {
        if (!meetingA.name) return -1;
        if (!meetingB.name) return 1;
        return meetingA.name.localeCompare(meetingB.name);
      }

      // then by location name
      if (meetingA.location !== meetingB.location) {
        if (!meetingA.location) return -1;
        if (!meetingB.location) return 1;
        return meetingA.location.localeCompare(meetingB.location);
      }

      return 0;
    });

    // find in-progress meetings
    const inProgress = input.weekday?.length
      ? []
      : filteredSlugs.filter(slug => {
          const { start, end, types } = meetings[slug];
          if (!start || !end) return false;
          return (
            start < now_offset && end > now && !types?.includes('inactive')
          );
        });

    const meeting = slug && slug in meetings ? meetings[slug] : undefined;

    setAlert(
      !filteredSlugs.length && !inProgress.length
        ? strings.no_results
        : undefined
    );

    setFilter({
      filteredSlugs,
      inProgress,
      meeting,
      waitingForFilter: false,
    });
  }, [meetings, input, latitude, longitude, slug]);

  return (
    <FilterContext.Provider value={{ ...filter, alert }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => useContext(FilterContext);
