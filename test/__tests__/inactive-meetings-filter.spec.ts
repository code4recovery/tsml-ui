import { describe, expect, it } from 'vitest';

import { loadMeetingData } from '../../src/helpers/load-meeting-data';
import { defaults } from '../../src/hooks';

import type { JSONData } from '../../src/types';

describe('Inactive meetings in filters', () => {
  it('includes inactive meetings in filter indexes when active meetings exist', () => {
    const data: JSONData[] = [
      {
        name: 'Active Women Meeting',
        slug: 'active-women',
        time: '09:00',
        address: '123 Main St',
        city: 'Portland',
        state: 'OR',
        country: 'USA',
        latitude: 45.5,
        longitude: -122.6,
        day: '5', // Friday
        types: ['W'], // Women
      },
      {
        name: 'Inactive Women Meeting',
        slug: 'inactive-women',
        formatted_address: 'Portland, OR, USA',
        day: '5', // Friday
        time: '19:00',
        types: ['W'], // Women - but meeting is inactive (no address/conference)
      },
    ];

    const { indexes, meetings } = loadMeetingData(
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

    // Verify meetings are correctly marked
    expect(meetings['active-women'].isActive).toBe(true);
    expect(meetings['inactive-women'].isActive).toBe(false);

    // Both meetings should be in the Women type index
    const womenType = indexes.type.find(t => t.key === 'women');
    expect(womenType).toBeDefined();
    expect(womenType?.slugs).toContain('active-women');
    expect(womenType?.slugs).toContain('inactive-women');

    // Both meetings should be in the Friday weekday index
    const fridayWeekday = indexes.weekday.find(w => w.key === 'friday');
    expect(fridayWeekday).toBeDefined();
    expect(fridayWeekday?.slugs).toContain('active-women');
    expect(fridayWeekday?.slugs).toContain('inactive-women');
  });

  it('hides filter options when all meetings are inactive', () => {
    const data: JSONData[] = [
      {
        name: 'Active Meeting',
        slug: 'active-meeting',
        time: '09:00',
        address: '123 Main St',
        city: 'Portland',
        state: 'OR',
        country: 'USA',
        latitude: 45.5,
        longitude: -122.6,
        day: '0', // Sunday
      },
      {
        name: 'Inactive Women Meeting',
        slug: 'inactive-women',
        formatted_address: 'Portland, OR, USA',
        day: '5', // Friday
        time: '19:00',
        types: ['W'], // Women - but meeting is inactive
      },
    ];

    const { indexes } = loadMeetingData(
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

    // Women type should NOT be in the index (all Women meetings are inactive)
    const womenType = indexes.type.find(t => t.key === 'women');
    expect(womenType).toBeUndefined();

    // Friday should NOT be in the weekday index (all Friday meetings are inactive)
    const fridayWeekday = indexes.weekday.find(w => w.key === 'friday');
    expect(fridayWeekday).toBeUndefined();

    // Sunday SHOULD be in the weekday index (has active meeting)
    const sundayWeekday = indexes.weekday.find(w => w.key === 'sunday');
    expect(sundayWeekday).toBeDefined();
    expect(sundayWeekday?.slugs).toContain('active-meeting');
  });

  it('preserves special metatypes regardless of active status', () => {
    const data: JSONData[] = [
      {
        name: 'Inactive Meeting',
        slug: 'inactive-meeting',
        formatted_address: 'Portland, OR, USA',
      },
    ];

    const { indexes } = loadMeetingData(
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

    // Inactive metatype should be present even though all meetings are inactive
    const inactiveType = indexes.type.find(t => t.key === 'inactive');
    expect(inactiveType).toBeDefined();
    expect(inactiveType?.slugs).toContain('inactive-meeting');
  });
});
