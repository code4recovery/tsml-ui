import { Translation } from '../types';

import { loadMeetingData } from './load-meeting-data';
import { translateGoogleSheet } from './translate-google-sheet';

export function fetchJson({
  google,
  settings,
  src,
  strings,
  timezone,
}: {
  google?: string;
  settings: TSMLReactConfig;
  src?: string;
  strings: Translation;
  timezone?: string;
}) {
  console.log('fetchJson', src, settings, strings, timezone);

  if (!src) {
    throw new Error('Configuration error: a data source is required.');
  }

  const sheetId = src.startsWith('https://docs.google.com/spreadsheets/d/')
    ? src.split('/')[5]
    : undefined;

  // google sheet
  if (sheetId) {
    if (!google) {
      throw new Error('Configuration error: a Google API key is required.');
    }
    src = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:ZZ?key=${google}`;
  }

  /* cache busting
  if (src.endsWith('.json') && input.meeting) {
    src = `${src}?${new Date().getTime()}`;
  }
  */

  return fetch(src)
    .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
    .then(data => {
      console.log('fetched data');

      if (sheetId) {
        data = translateGoogleSheet(data, sheetId, settings);
      }

      if (!Array.isArray(data)) {
        throw new Error(
          'Configuration error: data is not in the correct format.'
        );
      }

      if (!data.length) {
        throw new Error('Configuration error: no meetings to display.');
      }

      if (timezone) {
        try {
          // check if timezone is valid
          Intl.DateTimeFormat(undefined, { timeZone: timezone });
        } catch (e) {
          throw new Error(
            `Timezone ${timezone} is not valid. Please use one like Europe/Rome.`
          );
        }
      }

      const { capabilities, indexes, meetings } = loadMeetingData({
        data,
        settings,
        strings,
        timezone,
      });

      if (!timezone && !Object.keys(meetings).length) {
        throw new Error('Configuration error: time zone is not set.');
      }

      /*
    const waitingForGeo =
      (!input.latitude || !input.longitude) &&
      ((input.mode === 'location' && input.search) ||
        input.mode === 'me');
*/

      return {
        capabilities,
        indexes,
        meetings,
      };
    })
    .catch(error => {
      const errors = {
        400: 'bad request',
        401: 'unauthorized',
        403: 'forbidden',
        404: 'not found',
        429: 'too many requests',
        500: 'internal server',
        502: 'bad gateway',
        503: 'service unavailable',
        504: 'gateway timeout',
      };
      throw new Error(
        errors[error as keyof typeof errors]
          ? `Error: ${errors[error as keyof typeof errors]} (${error}) when ${
              sheetId ? 'contacting Google' : 'loading data'
            }.`
          : error.toString()
      );
    });
}
