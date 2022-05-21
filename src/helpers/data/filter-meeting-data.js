import moment from 'moment-timezone';

import { settings } from '../settings';
import { getIndexByKey } from './get-index-by-key';
import { calculateDistances } from './calculate-distances';

//run filters on meetings; this is run at every render
export function filterMeetingData(state, setState, mapbox) {
  const matchGroups = [];
  const slugs = Object.keys(state.meetings);

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
          andTerm.every(term => state.meetings[slug].search.search(term) !== -1)
        )
      );
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
            access_token: mapbox,
            autocomplete: false,
            language: settings.language,
          })}`
        )
          .then(result => result.json())
          .then(result => {
            if (result.features && result.features.length) {
              //re-render page with new params
              calculateDistances(
                result.features[0].center[1],
                result.features[0].center[0],
                filteredSlugs,
                state,
                setState
              );
            } else {
              //show error
            }
          });
      } else if (state.input.mode === 'me') {
        navigator.geolocation.getCurrentPosition(
          position => {
            calculateDistances(
              position.coords.latitude,
              position.coords.longitude,
              filteredSlugs,
              state,
              setState
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
    ? matchGroups.shift().filter(v => matchGroups.every(a => a.includes(v))) //get intersection of slug arrays
    : slugs; //get everything

  //sort slugs
  filteredSlugs.sort((a, b) => {
    const meetingA = state.meetings[a];
    const meetingB = state.meetings[b];

    //sort appointment meetings to the end
    if (meetingA.time && !meetingB.time) return -1;
    if (!meetingA.time && meetingB.time) return 1;

    if (!state.input.weekday.length) {
      //if upcoming, sort by time_diff
      if (meetingA.minutes_now !== meetingB.minutes_now) {
        return meetingA.minutes_now - meetingB.minutes_now;
      }
    } else {
      if (meetingA.minutes_week !== meetingB.minutes_week) {
        return meetingA.minutes_week - meetingB.minutes_week;
      }
    }

    //then by distance
    if (meetingA.distance !== meetingB.distance) {
      if (meetingA.distance === null) return -1;
      if (meetingB.distance === null) return 1;
      return meetingA.distance - meetingB.distance;
    }

    //then by location name
    if (meetingA.location !== meetingB.location) {
      if (!meetingA.location) return -1;
      if (!meetingB.location) return 1;
      return meetingA.location.localeCompare(meetingB.location);
    }

    //then by meeting name
    if (meetingA.name !== meetingB.name) {
      if (!meetingA.name) return -1;
      if (!meetingB.name) return 1;
      return meetingA.name.localeCompare(meetingB.location);
    }

    return 0;
  });

  //find in-progress meetings
  const now = moment();
  const inProgress = filteredSlugs.filter(
    slug =>
      state.meetings[slug].start?.diff(now, 'minutes') < settings.now_offset &&
      state.meetings[slug].end?.isAfter() &&
      !state.meetings[slug].types.includes('inactive')
  );

  return [filteredSlugs, inProgress];
}
