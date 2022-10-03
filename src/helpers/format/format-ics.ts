import { DateTime } from 'luxon';

import { Meeting } from '../../types';
import { settings } from '../settings';
import { iOS } from '../user-agent';

//format ICS file for add to calendar
export function formatIcs(meeting: Meeting) {
  const fmt = "yyyyLLdd'T'HHmmss";

  if (!meeting.start) return;

  //need an end time. guess one hour if none specified
  if (!meeting.end) {
    meeting.end = meeting.start.plus({ minutes: settings.defaults.duration });
  }

  //make sure it's in the future
  if (meeting.start < DateTime.now()) {
    meeting.start = meeting.start.plus({ week: 1 });
    meeting.end = meeting.end.plus({ week: 1 });
  }

  //start building event
  const event = [
    `SUMMARY:${meeting.name}`,
    `DTSTAMP:${meeting.start.setZone('UTC').toFormat(fmt)}Z`,
    `DTSTART;TZID=${meeting.timezone}:${meeting.start.toFormat(fmt)}`,
    `DTEND;TZID=${meeting.timezone}:${meeting.end.toFormat(fmt)}`,
  ];

  //start building description
  const description = [];

  //add notes
  if (meeting.notes) {
    description.push(meeting.notes);
  }

  //add in-person info
  if (meeting.isInPerson) {
    event.push(`LOCATION:${meeting.location}\n${meeting.formatted_address}`);
    if (meeting.location_notes) {
      description.push(meeting.location_notes);
    }
  }

  //add online info
  if (meeting.isOnline) {
    if (meeting.conference_provider) {
      if (meeting.conference_url_notes) {
        description.push(meeting.conference_url_notes);
      }
      description.push(
        '----( Video Call )----',
        meeting.conference_url,
        '---===---'
      );
    }
    if (meeting.conference_phone) {
      description.push(meeting.conference_phone);
      if (meeting.conference_phone_notes) {
        description.push(meeting.conference_phone_notes);
      }
    }
  }

  if (description.length) {
    event.push(`DESCRIPTION:${description.join('\n')}`);
  }

  //add group website
  if (meeting.website) {
    event.push(`URL:${meeting.website}`);
  }

  //format event string
  const blob = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    ...event.map(line => line.replaceAll('\n', '\\n').replaceAll(',', '\\,')),
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n');

  if (iOS()) {
    //create data url for ios
    const uri = `data:text/calendar;charset=utf8,${blob}`;
    window.location = encodeURI(uri) as unknown as Location;
  } else {
    //create temporary link to download
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${meeting.name}.ics`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  }
}
