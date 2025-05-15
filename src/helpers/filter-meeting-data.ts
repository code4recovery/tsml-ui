import { Dispatch, SetStateAction } from 'react';

import { DateTime } from 'luxon';

import { calculateDistances } from './calculate-distances';
import { getIndexByKey } from './get-index-by-key';

import type { State } from '../types';

// filter meetings based on input
export function filterMeetingData(
  state: State,
  setState: Dispatch<SetStateAction<State>>,
  settings: TSMLReactConfig,
  strings: Translation
) {
  const matchGroups: string[][] = [];
  const now = DateTime.now();
  const now_offset = now.plus({ minute: settings.now_offset });
  const slugs = Object.keys(state.meetings);
  const timeDiff: { [index: string]: number } = {};

  if (state.loading) {
    return [[], []];
  }

  //filter by distance, region, time, type, and weekday
  settings.filters.forEach(filter => {
    if (state.input[filter]?.length && state.capabilities[filter]) {
      if (filter === 'type') {
        //get the intersection of types (Open AND Discussion)
        state.input['type'].forEach(type =>
          matchGroups.push(
            getIndexByKey(state.indexes[filter], type)?.slugs ?? []
          )
        );
      } else {
        //get the union of other filters (Monday OR Tuesday)
        matchGroups.push(
          [].concat.apply(
            [],
            // @ts-expect-error TODO
            state.input[filter].map(
              key => getIndexByKey(state.indexes[filter], key)?.slugs ?? []
            )
          )
        );
      }
    }
  });

  //handle keyword search or geolocation
  if (state.input.mode === 'search') {
    if (state.input.search) {
      const orTerms = state.input.search
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
          andTerm.every(
            term => state.meetings[slug].search?.search(term) !== -1
          )
        )
      );
      // @ts-expect-error TODO
      matchGroups.push([].concat.apply([], matches));
    }
  } else if (['me', 'location'].includes(state.input.mode)) {
    //only show meetings with physical locations
    matchGroups.push(
      slugs.filter(
        slug => state.meetings[slug].latitude && state.meetings[slug].latitude
      )
    );

    if (!state.input.latitude || !state.input.longitude) {
      if (
        state.input.mode === 'location' &&
        state.input.search &&
        state.filtering
      ) {
        const url =
          window.location.host === 'tsml-ui.test'
            ? 'geo.test'
            : 'geo.code4recovery.org';
        fetch(
          `https://${url}/api/geocode?${new URLSearchParams({
            application: 'tsml-ui',
            language: settings.language,
            referrer: window.location.href,
            search: state.input.search,
          })}`
        )
          .then(result => result.json())
          .then(({ results }) => {
            if (results?.length) {
              calculateDistances({
                latitude: results[0].geometry.location.lat,
                longitude: results[0].geometry.location.lng,
                setState,
                settings,
                slugs,
                state,
                strings,
              });
            } else {
              //show error
            }
          });
      } else if (state.input.mode === 'me') {
        setState(state => ({ ...state, filtering: true }));
        navigator.geolocation.getCurrentPosition(
          position => {
            calculateDistances({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              setState,
              settings,
              slugs,
              state,
              strings,
            });
          },
          error => {
            console.warn(`TSML UI geolocation error: ${error.message}`);
            setState(state => ({ ...state, filtering: false }));
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
      state.meetings[slug].start?.diff(now, 'minutes').minutes ?? -9999;
    //if time is earlier than X minutes ago, increment diff by a week
    if (timeDiff[slug] < settings.now_offset) {
      timeDiff[slug] += 10080;
    }
  });

  //sort slugs
  filteredSlugs.sort((a, b) => {
    const meetingA = state.meetings[a];
    const meetingB = state.meetings[b];

    //sort appointment meetings to the end
    if (meetingA.start && !meetingB.start) return -1;
    if (!meetingA.start && meetingB.start) return 1;

    //sort by time
    if (!state.input.weekday.length) {
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
  const inProgress = state.input.weekday?.length
    ? []
    : filteredSlugs.filter(slug => {
        const { start, end, types } = state.meetings[slug];
        if (!start || !end) return false;
        return start < now_offset && end > now && !types?.includes('inactive');
      });

  return [filteredSlugs, inProgress];
}
