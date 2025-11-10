import { describe, expect, it } from 'vitest';

import {
  flattenDays,
  loadMeetingData,
} from '../../src/helpers/load-meeting-data';
import { defaults } from '../../src/hooks';

import type { JSONData } from '../../src/types';

describe('loadMeetingData', () => {
  it('loads data correctly', () => {
    const data: JSONData[] = [
      {
        name: 'Test Meeting',
        slug: 'test-meeting',
        time: '09:00',
        end_time: '10:00',
        address: '123 Main St',
        city: 'Anytown',
        state: 'OK',
        country: 'USA',
        latitude: 37,
        longitude: -122,
        day: '0',
      },
      {
        name: 'Other Meeting',
        slug: 'other-meeting',
        time: '09:00',
        end_time: '10:00',
        address: '123 Main St',
        city: 'Anytown',
        state: 'OK',
        country: 'USA',
        latitude: 38,
        longitude: -121,
        day: '0',
      },
      {
        name: 'Inactive Meeting',
        slug: 'inactive-meeting',
        formatted_address: 'Anytown, OK, USA',
        latitude: 38,
        longitude: -121,
      },
    ];
    const { bounds, meetings, indexes, capabilities, slugs } = loadMeetingData(
      data,
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
      defaults,
      defaults.strings[defaults.language],
      'America/Los_Angeles'
    );
    expect(meetings['test-meeting']).toEqual(
      expect.objectContaining({
        address: '123 Main St',
        approximate: false,
        formatted_address: '123 Main St, Anytown, OK, USA',
        isActive: true,
        isInPerson: true,
        isOnline: false,
        isTempClosed: false,
        name: 'Test Meeting',
        regions: ['Anytown'],
        search: '123 main st, anytown, ok, usa\ttest meeting\tanytown',
        slug: 'test-meeting',
        types: ['in-person', 'active'],
      })
    );
    expect(indexes).toStrictEqual({
      distance: [],
      region: [
        {
          children: [],
          key: 'anytown',
          name: 'Anytown',
          slugs: ['test-meeting', 'other-meeting'],
        },
      ],
      time: [
        {
          key: 'morning',
          name: 'Morning',
          slugs: ['test-meeting', 'other-meeting'],
        },
        {
          key: 'appointment',
          name: 'Appointment',
          slugs: ['inactive-meeting'],
        },
      ],
      type: [
        {
          key: 'active',
          name: 'Active',
          slugs: ['test-meeting', 'other-meeting'],
        },
        {
          key: 'in-person',
          name: 'In-person',
          slugs: ['test-meeting', 'other-meeting'],
        },
        {
          key: 'inactive',
          name: 'Inactive',
          slugs: ['inactive-meeting'],
        },
      ],
      weekday: [
        {
          key: 'sunday',
          name: 'Sunday',
          slugs: ['test-meeting', 'other-meeting'],
        },
      ],
    });
    expect(capabilities).toStrictEqual({
      coordinates: true,
      distance: false,
      geolocation: undefined,
      inactive: true,
      location: false,
      region: true,
      sharing: false,
      time: true,
      type: true,
      weekday: true,
    });
    expect(slugs).toStrictEqual([
      'test-meeting',
      'other-meeting',
      'inactive-meeting',
    ]);
    expect(bounds).toStrictEqual({
      north: '38',
      south: '37',
      east: '-121',
      west: '-122',
    });
  });
});

it('flattenDays', () => {
  const input: Array<Partial<JSONData>> = [
    { slug: 'bar', day: '0' },
    { slug: 'foo', day: ['0', '1'] },
  ];

  const expected: Array<Partial<JSONData>> = [
    { slug: 'bar', day: 0 },
    { slug: 'foo-0', day: 0 },
    { slug: 'foo-1', day: 1 },
  ];

  expect(flattenDays(input)).toStrictEqual(expected);
});
