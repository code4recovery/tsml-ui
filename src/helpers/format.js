import { getQueryString } from './query-string';
import { settings, strings } from './settings';

//get address from formatted_address
export function formatAddress(formatted_address = '') {
  const address = formatted_address.split(', ');
  return address.length > 3 ? address[0] : null;
}

//ensure array-ness for formatFeedbackEmail()
function formatArray(unknown) {
  if (Array.isArray(unknown)) return unknown;
  const type = typeof unknown;
  if (type === 'string') return [unknown];
  if (type === 'object') return Object.values(unknown);
  return [];
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

//inspired by the functionality of jedwatson/classnames
export function formatClasses() {
  return Object.values(arguments)
    .map(arg =>
      typeof arg === 'string'
        ? arg
        : Array.isArray(arg)
        ? arg.join(' ')
        : typeof arg === 'object'
        ? Object.keys(arg)
            .filter(key => !!arg[key])
            .join(' ')
        : null
    )
    .filter(e => e)
    .join(' ');
}

//send back a string url to get directions with the appropriate provider
export function formatDirectionsUrl({
  formatted_address,
  latitude,
  longitude,
}) {
  //create a link for directions
  const iOS = typeof window !== 'undefined' && navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
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

//send back a mailto link to a feedback email
export function formatFeedbackEmail(feedback_emails, meeting) {
  //remove extra query params from meeting URL
  const input = getQueryString();
  const meetingUrl = formatUrl({ meeting: input.meeting });

  //build message
  const lines = [
    ``,
    '',
    '',
    '-----',
    strings.email_public_url.replace('%url%', meetingUrl),
  ];
  if (meeting.edit_url) {
    lines.push(strings.email_edit_url.replace('%url%', meeting.edit_url));
  }

  //build mailto link
  return `mailto:${formatArray(feedback_emails).join()}?${new URLSearchParams({
    subject: strings.email_subject.replace('%name%', meeting.name),
    body: lines.join('\n'),
  })
    .toString()
    .replaceAll('+', ' ')}`;
}

//format ICS file for add to calendar
export function formatIcs(meeting) {
  const fmt = 'YYYYMMDDTHHmmss';

  const url = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${meeting.name}`,
    `DTSTART:${meeting.start.clone().tz('UTC').format(fmt)}Z`,
    `DTSTART;TZID=/${meeting.timezone}:${meeting.start.format(fmt)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  if (meeting.end) {
    url.splice(
      -2,
      0,
      `DTEND:${meeting.end.clone().tz('UTC').format(fmt)}Z`,
      `DTEND;TZID=/${meeting.timezone}:${meeting.end.format(fmt)}`
    );
  } else {
    url.splice(
      -2,
      0,
      `DTEND:${meeting.start.clone().add(1, 'hour').tz('UTC').format(fmt)}Z`,
      `DTEND;TZID=/${meeting.timezone}:${meeting.start
        .clone()
        .add(1, 'hour')
        .format(fmt)}`
    );
  }

  //start building notes
  const notes = [
    meeting.conference_url_notes,
    meeting.conference_phone_notes,
    meeting.notes,
    meeting.location_notes,
  ];

  if (meeting.isInPerson) {
    //address for in-person meetings
    url.splice(
      -2,
      0,
      `LOCATION:${meeting.formatted_address.replaceAll(',', ';')}`
    );
    if (meeting.location) {
      notes.push(meeting.location);
    }
    if (meeting.latitude && meeting.longitude) {
      url.splice(-2, 0, `GEO:${meeting.latitude};${meeting.longitude}`);
    }
  } else if (meeting.location) {
    //location name
    url.splice(-2, 0, `LOCATION:${meeting.location}`);
  }

  //add notes if present
  const notesString = notes.filter(e => e).join('\\n');
  if (notesString) {
    url.splice(-2, 0, `DESCRIPTION:${notesString}`);
  }

  //add URL if present
  if (meeting.conference_provider) {
    url.splice(-2, 0, `URL:${meeting.conference_url.replaceAll('&amp;', '&')}`);
  }

  const urlString = url.join('\n');

  if (typeof window !== 'undefined') {
    if (/msie\s|trident\/|edge\//i.test(window.navigator.userAgent)) {
      //open/save link in IE and Edge
      const blob = new Blob([urlString], { type: 'text/calendar;charset=utf-8' });
      window.navigator.msSaveBlob(blob, 'download.ics');
    } else {
      //open/save link in modern browsers
      window.location = encodeURI(`data:text/calendar;charset=utf8,${urlString}`);
    }
  }
}

//turn Mountain View into mountain-view
export function formatSlug(str) {
  str = str.trim().toLowerCase();

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
    .replace(/-+$/, ''); // trim - from end of text
}

//format an internal link with correct query params
export function formatUrl(input) {
  const query = {};

  //distance, region, time, type, and weekday
  settings.filters
    .filter(filter => typeof input[filter] !== 'undefined')
    .filter(filter => input[filter]?.length)
    .forEach(filter => {
      query[filter] = input[filter].join('/');
    });

  //meeting, mode, search, view
  settings.params
    .filter(param => typeof input[param] !== 'undefined')
    .filter(param => input[param] !== settings.defaults[param])
    .forEach(param => {
      query[param] = input[param];
    });

  //create a query string with only values in use
  const queryString = new URLSearchParams(query)
    .toString()
    .replace(/%2F/g, '/')
    .replace(/%20/g, '+')
    .replace(/%2C/g, ',');

  const [path] = window.location.href.split('?');

  return `${path}${!!queryString.length ? `?${queryString}` : ''}`;
}
