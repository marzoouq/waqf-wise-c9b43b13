/**
 * Test: Utility Functions
 * اختبار تجريبي للتأكد من عمل بيئة الاختبار
 */

import { describe, it, expect } from 'vitest';

describe('Test Environment Setup', () => {
  it('should pass basic assertion', () => {
    expect(true).toBe(true);
  });

  it('should handle numbers correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle strings correctly', () => {
    expect('hello').toBe('hello');
  });

  it('should handle arrays correctly', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });

  it('should handle objects correctly', () => {
    const obj = { name: 'test', value: 42 };
    expect(obj).toHaveProperty('name');
    expect(obj.name).toBe('test');
  });
});

describe('Arabic Support', () => {
  it('should handle Arabic text', () => {
    const arabicText = 'مرحباً بك';
    expect(arabicText).toBe('مرحباً بك');
    expect(arabicText.length).toBeGreaterThan(0);
  });
});
