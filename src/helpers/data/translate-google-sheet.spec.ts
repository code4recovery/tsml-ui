import { JSONData } from '../../types';
import {
  GoogleSheetData,
  translateGoogleSheet,
} from './translate-google-sheet';

test('translateGoogleSheet', () => {
  const input: GoogleSheetData = {
    values: [
      ['Name', 'Types'],
      ['Test Meeting', 'Open, Women'],
    ],
  };
  const sheetId = 'abc123';

  const expected: Array<Partial<JSONData>> = [
    {
      edit_url: `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0&range=2:2+`,
      name: 'Test Meeting',
      types: ['O', 'W'],
    },
  ];

  expect(translateGoogleSheet(input, sheetId)).toStrictEqual(expected);
});
