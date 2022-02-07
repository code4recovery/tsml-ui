//recursive function to make sorted array from object index
export function flattenAndSortIndexes(index, sortFn) {
  return Object.values(index)
    .map(entry => {
      if (entry.children)
        entry.children = flattenAndSortIndexes(entry.children, sortFn);
      return entry;
    })
    .sort(sortFn);
}
