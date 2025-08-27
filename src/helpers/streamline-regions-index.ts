import type { Index } from '../types';

// clean up nodes that apply to all the parent's children
export const streamlineRegionsIndex = (
  indexes: Index[],
  meetingsCount: number
): Index[] =>
  indexes
    .filter(index => index.children || index.slugs.length < meetingsCount)
    .flatMap(index => {
      if (index.slugs.length === meetingsCount) {
        // recursively process children, flattening the result
        return streamlineRegionsIndex(index.children ?? [], index.slugs.length);
      }
      // return a new object with streamlined children if present
      return {
        ...index,
        children: index.children
          ? streamlineRegionsIndex(index.children, index.slugs.length)
          : undefined,
      };
    });
