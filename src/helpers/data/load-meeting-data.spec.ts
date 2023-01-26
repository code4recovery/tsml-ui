import type { JSONData } from '../../types';
import { flattenDays, loadMeetingData } from './load-meeting-data';

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
      },
      {
        name: 'Inactive Meeting',
        slug: 'inactive-meeting',
        formatted_address: 'Anytown, OK, USA',
      },
    ];
    const [meetings, indexes, capabilities] = loadMeetingData(
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
      'America/Los_Angeles'
    );
    expect(meetings).toStrictEqual({
      'test-meeting': {
        address: '123 Main St',
        approximate: false,
        formatted_address: '123 Main St, OK, USA',
        isActive: true,
        isInPerson: true,
        isOnline: false,
        isTempClosed: false,
        name: 'Test Meeting',
        regions: ['Anytown'],
        search: '123 main st, ok, usa\ttest meeting\tanytown',
        slug: 'test-meeting',
        timezone: 'America/Los_Angeles',
        types: ['in-person', 'active'],
      },
      'inactive-meeting': {
        approximate: true,
        formatted_address: 'Anytown, OK, USA',
        isActive: false,
        isInPerson: false,
        isOnline: false,
        isTempClosed: false,
        name: 'Inactive Meeting',
        regions: [],
        search: 'anytown, ok, usa\tinactive meeting',
        slug: 'inactive-meeting',
        timezone: 'America/Los_Angeles',
        types: ['inactive'],
      },
    });
    expect(indexes).toStrictEqual({
      distance: [],
      region: [
        {
          children: [],
          key: 'anytown',
          name: 'Anytown',
          slugs: ['test-meeting'],
        },
      ],
      time: [],
      type: [
        {
          key: 'active',
          name: 'Active',
          slugs: ['test-meeting'],
        },
        {
          key: 'in-person',
          name: 'In-person',
          slugs: ['test-meeting'],
        },
        {
          key: 'inactive',
          name: 'Inactive',
          slugs: ['inactive-meeting'],
        },
      ],
      weekday: [],
    });
    expect(capabilities).toStrictEqual({
      coordinates: false,
      distance: false,
      geolocation: undefined,
      inactive: true,
      location: false,
      region: true,
      sharing: false,
      time: false,
      type: true,
      weekday: false,
    });
  });
});

test('flattenDays', () => {
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
