import { describe, expect, it } from 'vitest';
import { streamlineRegionsIndex } from '../../src/helpers';
import type { Index } from '../../src/types';

describe('streamlineRegionsIndex', () => {
  it('removes top level regions that apply to all meetings', () => {
    const mockIndexes: Index[] = [
      {
        key: 'usa',
        name: 'United States',
        slugs: ['meeting-1', 'meeting-2', 'meeting-3'],
        children: [
          {
            key: 'california',
            name: 'California',
            slugs: ['meeting-1', 'meeting-2', 'meeting-3'],
            children: [
              {
                key: 'los-angeles',
                name: 'Los Angeles',
                slugs: ['meeting-1', 'meeting-2'],
              },
              {
                key: 'san-francisco',
                name: 'San Francisco',
                slugs: ['meeting-3'],
              },
            ],
          },
        ],
      },
    ];

    expect(streamlineRegionsIndex(mockIndexes, 3)).toEqual([
      {
        key: 'los-angeles',
        name: 'Los Angeles',
        slugs: ['meeting-1', 'meeting-2'],
      },
      {
        key: 'san-francisco',
        name: 'San Francisco',
        slugs: ['meeting-3'],
      },
    ]);
  });

  it("removes bottom regions that apply to all parent's meetings", () => {
    const mockIndexes: Index[] = [
      {
        key: 'usa',
        name: 'United States',
        slugs: ['meeting-1', 'meeting-2', 'meeting-3'],
        children: [
          {
            key: 'california',
            name: 'California',
            slugs: ['meeting-1', 'meeting-2', 'meeting-3'],
          },
        ],
      },
    ];

    expect(streamlineRegionsIndex(mockIndexes, 3)).toEqual([]);
  });
});
