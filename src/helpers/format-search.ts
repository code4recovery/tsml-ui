// sanitize search input
export const formatSearch = (search: string) =>
  search.replace(/[.*+?^${}()|[\]\\]/g, '');
