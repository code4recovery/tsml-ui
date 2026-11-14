import { DateTime } from 'luxon';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { formatGoogleUrl } from '../../../src/helpers/format-google-url';
import { formatIcs } from '../../../src/helpers/format-ics';
import { loadMeetingData } from '../../../src/helpers/load-meeting-data';
import { defaults } from '../../../src/hooks';

const timezone = 'America/New_York';
const createObjectURL = window.URL.createObjectURL;

describe('calendar end dates', () => {
  beforeEach(() => {
    window.URL.createObjectURL = vi.fn(() => 'blob:test-calendar');
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.URL.createObjectURL = createObjectURL;
  });

  it.each([
    {
      name: 'overnight meeting',
      date: '2026-10-02',
      day: '5',
      time: '23:30',
      end_time: '00:30',
      start: '20261002T233000',
      end: '20261003T003000',
      duration: 60,
    },
    {
      name: 'midnight end',
      date: '2026-10-02',
      day: '5',
      time: '23:30',
      end_time: '00:00',
      start: '20261002T233000',
      end: '20261003T000000',
      duration: 30,
    },
    {
      name: 'week and month boundary',
      date: '2026-05-31',
      day: '0',
      time: '23:30',
      end_time: '00:30',
      start: '20260531T233000',
      end: '20260601T003000',
      duration: 60,
    },
    {
      name: 'year boundary',
      date: '2026-12-31',
      day: '4',
      time: '23:30',
      end_time: '00:30',
      start: '20261231T233000',
      end: '20270101T003000',
      duration: 60,
    },
    {
      name: 'spring daylight-saving transition',
      date: '2026-03-07',
      day: '6',
      time: '23:30',
      end_time: '03:30',
      start: '20260307T233000',
      end: '20260308T033000',
      duration: 180,
    },
    {
      name: 'fall daylight-saving transition',
      date: '2026-10-31',
      day: '6',
      time: '23:30',
      end_time: '03:30',
      start: '20261031T233000',
      end: '20261101T033000',
      duration: 300,
    },
    {
      name: 'first occurrence of a repeated fall clock',
      date: '2026-10-31',
      day: '6',
      time: '23:30',
      end_time: '01:30',
      start: '20261031T233000',
      end: '20261101T013000',
      duration: 120,
      googleDates: '20261101T033000Z/20261101T053000Z',
    },
    {
      name: 'end clock after the spring gap day',
      date: '2026-03-08',
      day: '0',
      time: '23:30',
      end_time: '02:30',
      start: '20260308T233000',
      end: '20260309T023000',
      duration: 180,
    },
    {
      name: 'afternoon end on the following day',
      date: '2026-10-02',
      day: '5',
      time: '23:11',
      end_time: '12:11',
      start: '20261002T231100',
      end: '20261003T121100',
      duration: 780,
    },
    {
      name: 'same-day meeting',
      date: '2026-10-02',
      day: '5',
      time: '09:00',
      end_time: '10:00',
      start: '20261002T090000',
      end: '20261002T100000',
      duration: 60,
    },
    {
      name: 'equal start and end',
      date: '2026-10-02',
      day: '5',
      time: '23:30',
      end_time: '23:30',
      start: '20261002T233000',
      end: '20261002T233000',
      duration: 0,
    },
    {
      name: 'default duration across midnight',
      date: '2026-10-02',
      day: '5',
      time: '23:30',
      start: '20261002T233000',
      end: '20261003T010000',
      duration: 90,
    },
    {
      name: 'existing same-day spring gap normalization',
      date: '2026-03-08',
      day: '0',
      time: '03:10',
      end_time: '02:30',
      start: '20260308T031000',
      end: '20260308T033000',
      duration: 20,
    },
  ])(
    '$name',
    async ({
      date,
      day,
      time,
      end_time,
      start,
      end,
      duration,
      googleDates,
    }) => {
      const now = DateTime.fromISO(`${date}T00:00:00`, { zone: timezone });
      vi.spyOn(Date, 'now').mockReturnValue(now.toMillis());

      const { meetings } = loadMeetingData(
        [
          {
            name: 'Test Meeting',
            slug: 'test-meeting',
            formatted_address: 'Test City, NY, USA',
            day,
            time,
            end_time,
            timezone,
          },
        ],
        {
          coordinates: false,
          distance: false,
          geolocation: false,
          inactive: false,
          location: false,
          region: false,
          sharing: false,
          time: false,
          type: false,
          weekday: false,
        },
        { ...defaults, duration: 90 },
        defaults.strings[defaults.language],
        'UTC'
      );
      const meeting = meetings['test-meeting'];
      expect(meeting.start?.zoneName).toBe('UTC');

      formatIcs(meeting);

      const blob = vi.mocked(window.URL.createObjectURL).mock
        .calls[0][0] as Blob;
      expect(blob.type).toBe('text/calendar;charset=utf-8');
      const calendar = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blob);
      });
      expect(calendar.split('\n')).toContain(
        `DTSTART;TZID=${timezone}:${start}`
      );
      expect(calendar.split('\n')).toContain(`DTEND;TZID=${timezone}:${end}`);
      expect(meeting.end?.diff(meeting.start!, 'minutes').minutes).toBe(
        duration
      );
      if (googleDates) {
        const url = new URL(formatGoogleUrl(meeting)!);
        expect(url.searchParams.get('dates')).toBe(googleDates);
      }
    }
  );
});
