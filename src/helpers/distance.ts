import { settings } from './settings';
import type { Meeting } from '../types';

// Calculate the distance as the crow flies between two geometric points
// Adapted from: https://www.geodatasource.com/developers/javascript
export function distance(a: Meeting, b: Meeting) {
  if (!a?.latitude || !b?.latitude || !a?.longitude || !b?.longitude)
    return null;

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
