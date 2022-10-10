import type { Index } from '../../types';

//recursive function to make sorted array from object index
export function flattenAndSortIndexes(
  index: Index[],
  sortFn: (a: Index, b: Index) => number
) {
  return Object.values(index)
    .map(entry => {
      if (entry.children)
        entry.children = flattenAndSortIndexes(entry.children, sortFn);
      return entry;
    })
    .sort(sortFn);
}
