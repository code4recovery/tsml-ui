import { describe, expect, it } from 'vitest';
import { validateInput } from '../../src/helpers/validate-input';
import { defaults } from '../../src/hooks/settings';

describe('validateInput with weekday=today', () => {
  it('should convert "today" to the current weekday name', () => {
    const params = new URLSearchParams('weekday=today');
    const result = validateInput(params, defaults);
    
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const expectedDay = weekdays[new Date().getDay()];
    
    expect(result.weekday).toEqual([expectedDay]);
  });

  it('should handle "today" mixed with other days', () => {
    const params = new URLSearchParams('weekday=today/friday');
    const result = validateInput(params, defaults);
    
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const expectedDay = weekdays[new Date().getDay()];
    
    expect(result.weekday).toContain(expectedDay);
    expect(result.weekday).toContain('friday');
  });
});
