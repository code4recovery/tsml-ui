import { DateTime } from 'luxon';

import { Meeting } from '../types';

// build a Google Calendar pre-filled event URL from a meeting
export function formatGoogleUrl(meeting: Meeting): string | undefined {
  if (!meeting.start || !meeting.end) return;

  const fmt = "yyyyMMdd'T'HHmmss";

  let { start, end } = meeting;

  // make sure it's in the future (same logic as format-ics)
  if (start < DateTime.now()) {
    start = start.plus({ week: 1 });
    end = end.plus({ week: 1 });
  }

  const startUtc = start.setZone('UTC').toFormat(fmt) + 'Z';
  const endUtc = end.setZone('UTC').toFormat(fmt) + 'Z';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: meeting.name,
    dates: `${startUtc}/${endUtc}`,
    ctz: meeting.timezone ?? '',
  });

  // location
  if (meeting.isInPerson && meeting.formatted_address) {
    params.set(
      'location',
      [meeting.location, meeting.formatted_address].filter(Boolean).join(', ')
    );
  } else if (meeting.conference_url) {
    params.set('location', meeting.conference_url);
  }

  // description (mirrors format-ics)
  const description: string[] = [];
  if (meeting.notes) description.push(meeting.notes);
  if (meeting.isInPerson && meeting.location_notes) {
    description.push(meeting.location_notes);
  }
  if (meeting.isOnline) {
    if (meeting.conference_url) {
      if (meeting.conference_url_notes) {
        description.push(meeting.conference_url_notes);
      }
      description.push(`Join: ${meeting.conference_url}`);
    }
    if (meeting.conference_phone) {
      description.push(`Phone: ${meeting.conference_phone}`);
      if (meeting.conference_phone_notes) {
        description.push(meeting.conference_phone_notes);
      }
    }
  }
  if (meeting.website) description.push(meeting.website);
  if (description.length) {
    params.set('details', description.join('\n\n'));
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
