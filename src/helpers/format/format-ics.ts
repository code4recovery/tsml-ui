import { Meeting } from '../../types/Meeting';

//format ICS file for add to calendar
export function formatIcs(meeting: Meeting) {
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

  if (/msie\s|trident\/|edge\//i.test(window.navigator.userAgent)) {
    //open/save link in IE and Edge
    const blob = new Blob([urlString], { type: 'text/calendar;charset=utf-8' });
    window.navigator.msSaveBlob(blob, 'download.ics');
  } else {
    //open/save link in modern browsers
    const uri = `data:text/calendar;charset=utf8,${urlString}`;
    window.location = encodeURI(uri) as unknown as Location;
  }
}
