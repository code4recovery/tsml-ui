import type { Meeting } from '../types';

// calculate the distance between two geometric points
// adapted from: https://www.geodatasource.com/developers/javascript
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
