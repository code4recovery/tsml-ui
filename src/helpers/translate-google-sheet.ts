import { DateTime } from 'luxon';

import type { JSONData, Translation } from '../types';
import { formatSlug } from './format-slug';
import { en, es, fr, ja, sv } from '../i18n';
import { settings } from './settings';

export type GoogleSheetData = {
  values: string[][];
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

  const validTypes: { [index: string]: string } = {};
  const validCodes = Object.keys(en.types);
  validCodes.forEach(key => {
    validTypes[en.types[key as keyof Translation['types']]] = key;
    validTypes[es.types[key as keyof Translation['types']]] = key;
    validTypes[fr.types[key as keyof Translation['types']]] = key;
    validTypes[ja.types[key as keyof Translation['types']]] = key;
    validTypes[sv.types[key as keyof Translation['types']]] = key;
  });
  const validDays: { [index: string]: number } = {};
  settings.weekdays.forEach((key, index) => {
    validDays[en.days[key as keyof Translation['days']]] = index;
    validDays[es.days[key as keyof Translation['days']]] = index;
    validDays[fr.days[key as keyof Translation['days']]] = index;
    validDays[ja.days[key as keyof Translation['days']]] = index;
    validDays[sv.days[key as keyof Translation['days']]] = index;
  });

  data.values.forEach((row, index) => {
    //skip empty rows
    if (!row.filter(e => e).length) return;

    const meeting: JSONData = {};

    //fill values
    headers.forEach((header, index) => {
      if (row[index]) {
        if (header === 'types') {
          meeting.types = row[index]
            .split(',')
            .map(e => e.trim())
            .filter(type => validCodes.includes(type) || type in validTypes)
            .map(type => (type in validTypes ? validTypes[type] : type));
        } else if (header === 'regions') {
          meeting.regions = row[index].split('>').map(e => e.trim());
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
      if (meeting.day in validDays) {
        meeting.day = validDays[meeting.day];
      } else {
        delete meeting.day;
      }
    }

    //convert from 12/31/2022 to 2022-12-31
    if (meeting.updated && (meeting.updated.match(/\//g) || []).length === 2) {
      const [month, day, year] = meeting.updated.split('/');
      meeting.updated = `${year}-${month.padStart(2, '0')}-${day.padStart(
        2,
        '0'
      )}`;
    }

    meetings.push(meeting);
  });

  return meetings;
}
