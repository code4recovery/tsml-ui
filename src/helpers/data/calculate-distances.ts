import type { Index, Meeting, State } from '../../types';
import { settings } from '../settings';
import { flattenAndSortIndexes } from './flatten-and-sort-indexes';

//calculate distances
export function calculateDistances(
  filteredSlugs: string[],
  latitude: number,
  longitude: number,
  setState: (state: State) => void,
  state: State
) {
  //build new index and meetings array
  const distances: {
    [index: string]: Index;
  } = {};
  settings.distance_options.forEach(option => {
    distances[option] = {
      key: option.toString(),
      name: `${option} ${settings.distance_unit}`,
      slugs: [],
      children: [],
    };
  });

  //loop through and update or clear distances, and rebuild index
  filteredSlugs.forEach(slug => {
    const distance = getDistance({ latitude, longitude }, state.meetings[slug]);

    if (typeof distance === 'undefined') return;

    state.meetings[slug] = {
      ...state.meetings[slug],
      distance,
    };

    settings.distance_options.forEach(option => {
      if (distance <= option) {
        distances[option].slugs.push(slug);
      }
    });
  });

  //flatten index and set capability
  const distanceIndex = flattenAndSortIndexes(
    // @ts-expect-error TODO
    distances,
    (a: Index, b: Index) => parseInt(a.key) - parseInt(b.key)
  );
  state.capabilities.distance = !!distanceIndex.length;

  //this will cause a re-render with latitude and longitude now set
  setState({
    ...state,
    capabilities: state.capabilities,
    indexes: {
      ...state.indexes,
      distance: distanceIndex,
    },
    input: {
      ...state.input,
      latitude: parseFloat(latitude.toFixed(5)),
      longitude: parseFloat(longitude.toFixed(5)),
    },
    ready: true,
  });
}

// Calculate the distance as the crow flies between two geometric points
// Adapted from: https://www.geodatasource.com/developers/javascript
export function getDistance(
  a: { latitude: number; longitude: number },
  b: Meeting
) {
  if (!a?.latitude || !b?.latitude || !a?.longitude || !b?.longitude) return;

  if (a.latitude === b.latitude && a.longitude === b.longitude) {
    return 0;
  } else {
    const aRadLat = (Math.PI * a.latitude) / 180;
    const bRadLat = (Math.PI * b.latitude) / 180;
    const radTheta = (Math.PI * (a.longitude - b.longitude)) / 180;

    let dist =
      Math.sin(aRadLat) * Math.sin(bRadLat) +
      Math.cos(aRadLat) * Math.cos(bRadLat) * Math.cos(radTheta);

    // TODO: How to test the scenario for this line?
    if (dist > 1) dist = 1;

    dist = Math.acos(dist);
    dist = (dist * 12436.2) / Math.PI; // 12436.2 = 180 * 60 * 1.1515

    // If using kilometers, do an additional multiplication
    if (settings.distance_unit === 'km') dist *= 1.609344;

    return parseFloat(dist.toFixed(2));
  }
}
