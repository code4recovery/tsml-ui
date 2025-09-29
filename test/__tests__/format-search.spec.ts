import { formatSearch } from '../../src/helpers/format-search';

describe('formatSearch', () => {
  it('should format search strings correctly', () => {
    expect(formatSearch('Open Meeting')).toBe('Open Meeting');
    expect(formatSearch('Open | Meeting')).toBe('Open  Meeting');
    expect(formatSearch('Open * \\ Meeting')).toBe('Open   Meeting');
    expect(formatSearch('')).toBe('');
  });
});
