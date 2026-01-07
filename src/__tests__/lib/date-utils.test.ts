/**
 * Date Utils Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';
import { format, parseISO, isValid } from 'date-fns';

describe('Date Utils', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15');
    const formatted = format(date, 'yyyy-MM-dd');
    expect(formatted).toBe('2024-01-15');
  });

  it('should parse ISO date string', () => {
    const dateStr = '2024-01-15T10:30:00Z';
    const parsed = parseISO(dateStr);
    expect(isValid(parsed)).toBe(true);
  });

  it('should validate dates', () => {
    expect(isValid(new Date('2024-01-15'))).toBe(true);
    expect(isValid(new Date('invalid'))).toBe(false);
  });

  it('should format Arabic date', () => {
    const date = new Date('2024-01-15');
    const formatted = format(date, 'dd/MM/yyyy');
    expect(formatted).toBe('15/01/2024');
  });
});
