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
      meeting.time = DateTime.fromFormat(meeting.time, 'h:mm a').toFormat(
        'HH:mm'
      );
    }
    if (meeting.end_time) {
      meeting.end_time = DateTime.fromFormat(
        meeting.end_time,
        'h:mm a'
      ).toFormat('HH:mm');
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
