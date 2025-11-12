import { describe, expect, it } from 'vitest';
import { getIndexByKey } from '../../src/helpers/get-index-by-key';
import type { Index } from '../../src/types';

describe('getIndexByKey', () => {
  const mockIndexes: Index[] = [
    {
      key: 'region1',
      name: 'Region 1',
      slugs: ['meeting1', 'meeting2'],
    },
    {
      key: 'region2',
      name: 'Region 2',
      slugs: ['meeting3'],
      children: [
        {
          key: 'subregion1',
          name: 'Subregion 1',
          slugs: ['meeting4'],
        },
        {
          key: 'subregion2',
          name: 'Subregion 2',
          slugs: ['meeting5'],
          children: [
            {
              key: 'deepregion',
              name: 'Deep Region',
              slugs: ['meeting6'],
            },
          ],
        },
      ],
    },
    {
      key: 'region3',
      name: 'Region 3',
      slugs: [],
    },
  ];

  it('finds a top-level index by key', () => {
    const result = getIndexByKey(mockIndexes, 'region1');
    expect(result).toStrictEqual({
      key: 'region1',
      name: 'Region 1',
      slugs: ['meeting1', 'meeting2'],
    });
  });

  it('finds a nested index by key', () => {
    const result = getIndexByKey(mockIndexes, 'subregion1');
    expect(result).toStrictEqual({
      key: 'subregion1',
      name: 'Subregion 1',
      slugs: ['meeting4'],
    });
  });

  it('finds a deeply nested index by key', () => {
    const result = getIndexByKey(mockIndexes, 'deepregion');
    expect(result).toStrictEqual({
      key: 'deepregion',
      name: 'Deep Region',
      slugs: ['meeting6'],
    });
  });

  it('returns undefined when key is not found', () => {
    const result = getIndexByKey(mockIndexes, 'nonexistent');
    expect(result).toBeUndefined();
  });

  it('handles empty indexes array', () => {
    const result = getIndexByKey([], 'region1');
    expect(result).toBeUndefined();
  });

  it('handles indexes without children', () => {
    const result = getIndexByKey(mockIndexes, 'region3');
    expect(result).toStrictEqual({
      key: 'region3',
      name: 'Region 3',
      slugs: [],
    });
  });
});
