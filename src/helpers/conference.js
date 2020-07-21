import { settings } from './settings';

export function formatConferenceProvider(url) {
  const urlParts = url.split('/');
  if (urlParts.length < 2) return null;
  const provider = Object.keys(settings.conference_providers).filter(domain =>
    urlParts[2].endsWith(domain)
  );
  return provider.length ? settings.conference_providers[provider[0]] : null;
}
