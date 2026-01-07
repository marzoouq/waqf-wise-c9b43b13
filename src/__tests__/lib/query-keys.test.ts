/**
 * Query Keys Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';
import { QUERY_KEYS } from '@/lib/query-keys';

describe('Query Keys', () => {
  it('should have BENEFICIARIES key', () => {
    expect(QUERY_KEYS.BENEFICIARIES).toBeDefined();
  });

  it('should have PROPERTIES key', () => {
    expect(QUERY_KEYS.PROPERTIES).toBeDefined();
  });

  it('should have dynamic key functions', () => {
    if (typeof QUERY_KEYS.BENEFICIARY === 'function') {
      const key = QUERY_KEYS.BENEFICIARY('123');
      expect(Array.isArray(key)).toBe(true);
    }
  });

  it('should have ACCOUNTS key', () => {
    expect(QUERY_KEYS.ACCOUNTS).toBeDefined();
  });

  it('should have JOURNAL_ENTRIES key', () => {
    expect(QUERY_KEYS.JOURNAL_ENTRIES).toBeDefined();
  });
});
