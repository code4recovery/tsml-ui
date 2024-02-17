import { DateTime } from 'luxon';

import { calculateDistances } from './calculate-distances';
import { getIndexByKey } from './get-index-by-key';

import type { State } from '../types';

//run filters on meetings; this is run at every render
export function filterMeetingData({
  capabilities,
  indexes,
  input,
  meetings,
  settings,
  strings,
}: {
  capabilities: State['capabilities'];
  indexes: State['indexes'];
  input: State['input'];
  meetings: State['meetings'];
  settings: TSMLReactConfig;
  strings: Translation;
}) {
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

    if (!input.latitude || !input.longitude) {
      if (input.search && input.mode === 'location') {
        //make mapbox API request https://docs.mapbox.com/api/search/
        fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${
            input.search
          }.json?${new URLSearchParams({
            access_token: settings.mapbox ?? '',
            autocomplete: 'false',
            language: settings.language,
          })}`
        )
          .then(result => result.json())
          .then(result => {
            if (result.features && result.features.length) {
              //re-render page with new params
              calculateDistances({
                capabilities,
                latitude: result.features[0].center[1],
                longitude: result.features[0].center[0],
                meetings,
                settings,
                strings,
              });
            } else {
              //show error
            }
          });
      } else if (input.mode === 'me') {
        navigator.geolocation.getCurrentPosition(
          position => {
            calculateDistances({
              capabilities,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              meetings,
              settings,
              strings,
            });
          },
          error => {
            console.warn(`TSML UI geolocation error: ${error.message}`);
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
        return start < now_offset && end > now && !types?.includes('inactive');
      });

  return [filteredSlugs, inProgress];
}
