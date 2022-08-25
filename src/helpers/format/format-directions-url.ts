import { iOS } from '../user-agent';

//create a link for directions
export function formatDirectionsUrl({
  formatted_address,
  latitude,
  longitude,
}: {
  formatted_address: string;
  latitude?: number;
  longitude?: number;
}) {
  if (iOS()) {
    //iOS devices use Apple - https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html
    const params: { daddr: string; q?: string } =
      latitude && longitude
        ? { daddr: [latitude, longitude].join(), q: formatted_address }
        : { daddr: formatted_address };
    return `maps://?${new URLSearchParams(params)}`;
  }

  //other platforms use Google - https://developers.google.com/maps/documentation/urls/get-started#directions-action
  return `https://www.google.com/maps/dir/?${new URLSearchParams({
    api: '1',
    destination:
      latitude && longitude ? [latitude, longitude].join() : formatted_address,
  })}`;
}
