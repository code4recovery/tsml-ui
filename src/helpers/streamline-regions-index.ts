import type { Index } from '../types';

// recursively hoist single-child nodes
export const streamlineRegionIndex = (indexes: Index[]): Index[] => {
  const streamlined = indexes.map(item => {
    if (item.children?.length === 1) {
      return {
        ...item.children[0],
        children: streamlineRegionIndex(item.children[0].children || []),
      };
    }
    if (item.children?.length) {
      return {
        ...item,
        children: streamlineRegionIndex(item.children),
      };
    }
    return item;
  });
  if (streamlined.length === 1) {
    return streamlined[0].children || [];
  }
  return streamlined;
};
