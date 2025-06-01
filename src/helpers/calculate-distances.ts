import { flattenAndSortIndexes } from './flatten-and-sort-indexes';
import { formatString as i18n } from './format-string';

import { useData, useInput } from '../hooks';
import type { Index, Meeting } from '../types';

//calculate distances
export function calculateDistances({
  latitude,
  longitude,
  setCoordinates,
  settings,
  slugs,
  strings,
}: {
  latitude: number;
  longitude: number;
  setCoordinates: (coordinates: {
    latitude?: number;
    longitude?: number;
    waiting: boolean;
  }) => void;
  settings: TSMLReactConfig;
  slugs: string[];
  strings: Translation;
}) {
  const input = useInput();
  const { meetings } = useData();

  //build new index and meetings array
  const distances: {
    [index: string]: Index;
  } = {};
  settings.distance_options.forEach(option => {
    distances[option] = {
      key: option.toString(),
      name: i18n(
        settings.distance_unit === 'km'
          ? strings.distance_km
          : strings.distance_mi,
        { distance: option }
      ),
      slugs: [],
      children: [],
    };
  });

  //loop through and update or clear distances, and rebuild index
  slugs.forEach(slug => {
    const distance = getDistance(
      { latitude, longitude },
      meetings[slug],
      settings
    );

    if (typeof distance === 'undefined') return;

    meetings[slug] = {
      ...meetings[slug],
      distance,
    };

    settings.distance_options.forEach(option => {
      if (distance <= option) {
        distances[option].slugs.push(slug);
      }
    });
  });

  //remove redundant distances at 50 and higher distances, unless requested via query param
  let slugMax = 0;
  let queryDistance = Array.isArray(input?.distance) ? input.distance[0] : 0;
  Object.entries(distances).forEach(([val, distance]) => {
    if (50 <= parseInt(val) && val !== queryDistance) {
      if (slugMax >= distance.slugs.length) {
        delete distances[val];
      }
    }
    slugMax = Math.max(slugMax, distance.slugs.length);
  });

  //flatten index and set capability
  const distanceIndex = flattenAndSortIndexes(
    // @ts-expect-error TODO
    distances,
    (a: Index, b: Index) => parseInt(a.key) - parseInt(b.key)
  );

  // //this will cause a re-render with latitude and longitude now set
  // setState(state => ({
  //   ...state,
  //   capabilities: {
  //     ...state.capabilities,
  //     distance: !!distanceIndex.length,
  //   },
  //   filtering: false,
  //   indexes: {
  //     ...state.indexes,
  //     distance: distanceIndex,
  //   },
  //   input: {
  //     ...state.input,
  //     latitude: parseFloat(latitude.toFixed(5)),
  //     longitude: parseFloat(longitude.toFixed(5)),
  //   },
  // }));
}

// Calculate the distance as the crow flies between two geometric points
// Adapted from: https://www.geodatasource.com/developers/javascript
export function getDistance(
  a: { latitude: number; longitude: number },
  b: Meeting,
  settings: TSMLReactConfig
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

    if (dist < 10) {
      return Math.round(dist * 100) / 100;
    }

    if (dist < 100) {
      return Math.round(dist * 10) / 10;
    }

    return Math.round(dist);
  }
}
