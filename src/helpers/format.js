import { createElement } from 'react';
import { settings } from './settings';

//get address from formatted_address
export function formatAddress(formatted_address = '') {
  const address = formatted_address.split(', ');
  return address.length > 3 ? address[0] : null;
}

//get name of provider from url
export function formatConferenceProvider(url) {
  const urlParts = url.split('/');
  if (urlParts.length < 2) return null;
  const provider = Object.keys(settings.conference_providers).filter(domain =>
    urlParts[2].endsWith(domain)
  );
  return provider.length ? settings.conference_providers[provider[0]] : null;
}

//send back a string url to get directions with the appropriate provider
export function formatDirectionsUrl({
  formatted_address,
  latitude,
  longitude,
}) {
  //create a link for directions
  const iOS = navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
  const baseURL = iOS ? 'maps://' : 'https://www.google.com/maps';
  const params = { saddr: 'Current Location' };
  if (latitude && longitude) {
    params['daddr'] = [latitude, longitude].join();
    params['q'] = formatted_address;
  } else {
    params['daddr'] = formatted_address;
  }
  return `${baseURL}?${new URLSearchParams(params)}`;
}

//turn Mountain View into mountain-view
export function formatSlug(str, separator = '-') {
  str = str.trim();
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  const from = 'åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;';
  const to = 'aaaaaaeeeeiiiioooouuuunc------';

  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  return str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-') // collapse dashes
    .replace(/^-+/, '') // trim - from start of text
    .replace(/-+$/, '') // trim - from end of text
    .replace(/-/g, separator);
}
