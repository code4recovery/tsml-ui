import { DateTime } from 'luxon';

import type { JSONData } from '../../types';
import { formatSlug } from '../format';
import { settings } from '../settings';

type GoogleSheetData = {
  values: [string[]];
};

//translates Google Sheet JSON into Meeting Guide format (example puget-sound.html)
export function translateGoogleSheet(data: GoogleSheetData, sheetId: string) {
  if (!data.values || !data.values.length) return;

  const meetings: JSONData[] = [];

  // @ts-expect-error TODO
  const headers = data.values
    .shift()
    .map(header => formatSlug(header).replaceAll('-', '_'))
    .map(header => (header === 'id' ? 'slug' : header))
    .map(header => (header === 'full_address' ? 'formatted_address' : header));

  data.values.forEach((row, index) => {
    //skip empty rows
    if (!row.filter(e => e).length) return;

    const meeting: JSONData = {};

    //fill values
    headers.forEach((header, index) => {
      if (row[index]) {
        if (header === 'types') {
          meeting.types = row[index].split(',').map(e => e.trim());
        } else {
          // @ts-expect-error TODO
          meeting[header as keyof JSONData] = row[index];
        }
      }
    });

    //edit url link
    meeting.edit_url = `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0&range=${
      index + 2
    }:${index + 2}+`;

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
          `TSML UI error parsing ${meeting.time} (${time.invalidExplanation}): ${meeting.edit_url}`
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
          `TSML UI error parsing ${meeting.end_time} (${end_time.invalidExplanation}): ${meeting.edit_url}`
        );
      }
    }

    if (meeting.day && typeof meeting.day === 'string') {
      meeting.day = meeting.day.toLowerCase();
      //@ts-expect-error TODO
      if (settings.weekdays.includes(meeting.day)) {
        //@ts-expect-error TODO
        meeting.day = settings.weekdays.indexOf(meeting.day);
      }
    }

    meetings.push(meeting);
  });

  return meetings;
}
