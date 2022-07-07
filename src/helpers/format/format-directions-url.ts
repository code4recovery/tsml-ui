import { iOS } from '../user-agent';

//send back a string url to get directions with the appropriate provider
export function formatDirectionsUrl({
  formatted_address,
  latitude,
  longitude,
}: {
  formatted_address: string;
  latitude?: number;
  longitude?: number;
}) {
  //create a link for directions
  const baseURL = iOS() ? 'maps://' : 'https://www.google.com/maps/dir/';
  const destination = (latitude && longitude) 
    ? [latitude, longitude].join() 
    : formatted_address;
  const params = {
    api: "1",
    destination
  };

  return `${baseURL}?${new URLSearchParams(params)}`;
}
