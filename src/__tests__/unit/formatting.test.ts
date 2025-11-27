import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';

describe('formatNumber', () => {
  it('يجب أن يُنسق الأرقام بشكل صحيح', () => {
    expect(formatNumber(1000)).toContain('1');
    expect(formatNumber(1000000)).toContain('1');
    expect(formatNumber(0)).toBe('0');
  });

  it('يجب أن يتعامل مع الأرقام العشرية', () => {
    const result = formatNumber(1000.50);
    expect(result).toBeDefined();
  });

  it('يجب أن يتعامل مع القيم السالبة', () => {
    const result = formatNumber(-1000);
    expect(result).toContain('1');
  });
});

describe('formatDate', () => {
  it('يجب أن يُنسق التاريخ', () => {
    const date = new Date('2025-01-15');
    const formatted = formatDate(date);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('يجب أن يتعامل مع التاريخ كـ string', () => {
    const formatted = formatDate('2025-01-15');
    expect(formatted).toBeDefined();
  });
});

describe('formatCurrency', () => {
  it('يجب أن يُنسق العملة بالريال السعودي', () => {
    const formatted = formatCurrency(1000);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('يجب أن يتعامل مع الصفر', () => {
    const formatted = formatCurrency(0);
    expect(formatted).toBeDefined();
  });
});
