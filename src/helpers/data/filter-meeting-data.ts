import { DateTime } from 'luxon';

import type { State } from '../../types';
import { settings } from '../settings';
import { getIndexByKey } from './get-index-by-key';
import { calculateDistances } from './calculate-distances';

//run filters on meetings; this is run at every render
export function filterMeetingData(
  state: State,
  setState: (state: State) => void,
  mapbox?: string
) {
  const matchGroups: string[][] = [];
  const now = DateTime.now();
  const now_offset = now.plus({ minute: settings.now_offset });
  const slugs = Object.keys(state.meetings);
  const timeDiff: { [index: string]: number } = {};

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
      if (state.input.search && state.input.mode === 'location') {
        //make mapbox API request https://docs.mapbox.com/api/search/
        fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${
            state.input.search
          }.json?${new URLSearchParams({
            access_token: mapbox ?? '',
            autocomplete: 'false',
            language: settings.language,
          })}`
        )
          .then(result => result.json())
          .then(result => {
            if (result.features && result.features.length) {
              //re-render page with new params
              calculateDistances(
                filteredSlugs,
                result.features[0].center[1],
                result.features[0].center[0],
                setState,
                state
              );
            } else {
              //show error
            }
          });
      } else if (state.input.mode === 'me') {
        navigator.geolocation.getCurrentPosition(
          position => {
            calculateDistances(
              filteredSlugs,
              position.coords.latitude,
              position.coords.longitude,
              setState,
              state
            );
          },
          error => {
            console.warn(`TSML UI geolocation error: ${error}`);
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
