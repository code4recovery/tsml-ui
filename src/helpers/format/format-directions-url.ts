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
  const iOS = navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
  const baseURL = iOS ? 'maps://' : 'https://www.google.com/maps';
  const params: { saddr: string; daddr?: string; q?: string } = {
    saddr: 'Current Location',
  };

  if (latitude && longitude) {
    params['daddr'] = [latitude, longitude].join();
    params['q'] = formatted_address;
  } else {
    params['daddr'] = formatted_address;
  }

  return `${baseURL}?${new URLSearchParams(params)}`;
}
