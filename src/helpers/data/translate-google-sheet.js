import { DateTime } from 'luxon';

import { formatSlug } from '../format';

//translates Google Sheet JSON into Meeting Guide format (example puget-sound.html)
export function translateGoogleSheet(data, json) {
  if (!data.values) return;

  const sheetId = json.split('/')[5];

  const meetings = [];

  const headers = data.values
    .shift()
    .map(header => formatSlug(header).replaceAll('-', '_'))
    .map(header => (header === 'id' ? 'slug' : header))
    .map(header => (header === 'full_address' ? 'formatted_address' : header));

  data.values.forEach((row, index) => {
    //skip empty rows
    if (!row.filter(e => e).length) return;

    const meeting = {};

    //fill values
    headers.forEach((header, index) => {
      meeting[header] = row[index];
    });

    //convert time to HH:MM
    if (meeting.time) {
      const time = DateTime.fromFormat(meeting.time, 'h:mm a', {
        locale: 'en',
      });
      if (time.isValid) {
        meeting.time = time.toFormat('HH:mm');
      } else {
        meeting.time = undefined;
        console.warn(
          `TSML UI error parsing ${meeting.time}: ${time.invalidReason}`
        );
      }
    }
    if (meeting.end_time) {
      const end_time = DateTime.fromFormat(meeting.end_time, 'h:mm a', {
        locale: 'en',
      });
      if (end_time.isValid) {
        meeting.end_time = end_time.toFormat('HH:mm');
      } else {
        meeting.end_time = undefined;
        console.warn(
          `TSML UI error parsing ${meeting.end_time}: ${end_time.invalidReason}`
        );
      }
    }

    //types
    meeting.types = meeting.types.split(',').map(e => e.trim());

    //edit url link
    meeting.edit_url = `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0&range=${
      index + 2
    }:${index + 2}+`;

    meetings.push(meeting);
  });

  return meetings;
}
