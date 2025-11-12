import { describe, expect, it } from 'vitest';
import {
  GoogleSheetData,
  translateGoogleSheet,
} from '../../src/helpers/translate-google-sheet';
import { defaults } from '../../src/hooks/settings';
import { JSONData } from '../../src/types';

describe('translateGoogleSheet', () => {
  const sheetId = 'abc123';

  it('parses correctly', () => {
    const input: GoogleSheetData = {
      values: [
        ['Name', 'Types', 'Regions', 'Time', 'End Time', 'Day', 'Updated'],
        [
          'Test Meeting',
          'Open, Women',
          'City > Neighborhood',
          '6:00 PM',
          '7:00 PM',
          'Sunday',
          '10/31/2022',
        ],
        [
          'Invalid Meeting',
          'O, W',
          'City > Neighborhood',
          'Invalid time',
          'Invalid time',
          'Invalid day',
          '2022-10-31',
        ],
      ],
    };

    const expected: Array<Partial<JSONData>> = [
      {
        edit_url: `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0&range=2:2+`,
        end_time: '19:00',
        name: 'Test Meeting',
        regions: ['City', 'Neighborhood'],
        time: '18:00',
        types: ['O', 'W'],
        day: 0,
        updated: '2022-10-31',
      },
      {
        edit_url: `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0&range=3:3+`,
        name: 'Invalid Meeting',
        regions: ['City', 'Neighborhood'],
        types: ['O', 'W'],
        end_time: undefined,
        time: undefined,
        updated: '2022-10-31',
      },
    ];

    expect(translateGoogleSheet(input, sheetId, defaults)).toStrictEqual(
      expected
    );
  });

  it('handles non-spec values', () => {
    const input: GoogleSheetData = {
      values: [['ID', 'Full Address', 'Test'], ['123', '123 Main St'], []],
    };

    const expected: Array<Partial<JSONData>> = [
      {
        edit_url: `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0&range=2:2+`,
        slug: '123',
        formatted_address: '123 Main St',
      },
    ];

    expect(translateGoogleSheet(input, sheetId, defaults)).toStrictEqual(
      expected
    );
  });

  it('returns empty when sheet is empty', () => {
    expect(
      translateGoogleSheet({ values: [] }, sheetId, defaults)
    ).toStrictEqual([]);
  });
});
