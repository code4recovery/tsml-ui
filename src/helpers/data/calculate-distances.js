import { distance } from '../distance';
import { settings } from '../settings';
import { flattenAndSortIndexes } from './flatten-and-sort-indexes';

//calculate distances
export function calculateDistances(
  latitude,
  longitude,
  filteredSlugs,
  state,
  setState
) {
  //build new index and meetings array
  const distances = {};

  //loop through and update or clear distances, and rebuild index
  filteredSlugs.forEach(slug => {
    state.meetings[slug] = {
      ...state.meetings[slug],
      distance: distance(
        { latitude: latitude, longitude: longitude },
        state.meetings[slug]
      ),
    };

    [1, 2, 5, 10, 25].forEach(distance => {
      if (state.meetings[slug].distance <= distance) {
        if (!distances.hasOwnProperty(distance)) {
          distances[distance] = {
            key: distance.toString(),
            name: `${distance} ${settings.distance_unit}`,
            slugs: [],
          };
        }
        distances[distance].slugs.push(slug);
      }
    });
  });

  //flatten index and set capability
  const distanceIndex = flattenAndSortIndexes(
    distances,
    (a, b) => parseInt(a.key) - parseInt(b.key)
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
  });
}
