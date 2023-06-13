import { settings } from './settings';

//get name of provider from url
export function formatConferenceProvider(url: string) {
  const urlParts = url.split('/');
  if (urlParts.length < 2) return undefined;
  const provider = Object.keys(settings.conference_providers).filter(domain =>
    urlParts[2].endsWith(domain)
  );
  return provider.length
    ? settings.conference_providers[provider[0]]
    : undefined;
}
