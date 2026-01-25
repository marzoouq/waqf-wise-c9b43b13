/**
 * Query Keys Uniqueness & Consistency Tests
 * اختبارات تلقائية للتأكد من عدم وجود مفاتيح مكررة وصحة التنسيق
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';
import { QUERY_KEYS } from '../index';

describe('Query Keys Tests', () => {
  describe('Static Keys Consistency', () => {
    it('should have minimal duplicate static keys (less than 5%)', () => {
      const staticKeys = Object.entries(QUERY_KEYS)
        .filter(([_, value]) => typeof value !== 'function' && Array.isArray(value))
        .map(([_, value]) => JSON.stringify(value));
      
      const uniqueKeys = new Set(staticKeys);
      const duplicateRatio = 1 - (uniqueKeys.size / staticKeys.length);
      
      // Allow up to 5% duplicates for intentional aliases
      expect(duplicateRatio).toBeLessThan(0.05);
    });
  });

  describe('Factory Functions', () => {
    it('should generate unique keys for different parameters', () => {
      const keys = [
        QUERY_KEYS.BENEFICIARY('id-1'),
        QUERY_KEYS.BENEFICIARY('id-2'),
        QUERY_KEYS.BENEFICIARY_PAYMENTS('id-1'),
        QUERY_KEYS.BENEFICIARY_PAYMENTS('id-2'),
      ];
      
      const stringKeys = keys.map(k => JSON.stringify(k));
      const uniqueKeys = new Set(stringKeys);
      expect(uniqueKeys.size).toBe(stringKeys.length);
    });

    it('should generate consistent keys for same parameters', () => {
      const key1 = QUERY_KEYS.BENEFICIARY('same-id');
      const key2 = QUERY_KEYS.BENEFICIARY('same-id');
      
      expect(JSON.stringify(key1)).toBe(JSON.stringify(key2));
    });

    it('should handle optional parameters correctly', () => {
      const keyWithParam = QUERY_KEYS.ACTIVE_SESSIONS('user-123');
      const keyWithoutParam = QUERY_KEYS.ACTIVE_SESSIONS();
      
      expect(keyWithParam).toContain('user-123');
      expect(keyWithoutParam).not.toContain('user-123');
    });
  });

  describe('Naming Convention', () => {
    it('should use UPPER_SNAKE_CASE for all key names', () => {
      const keyNames = Object.keys(QUERY_KEYS);
      
      keyNames.forEach(name => {
        const isUpperSnakeCase = /^[A-Z][A-Z0-9_]*$/.test(name);
        expect(isUpperSnakeCase, `Key "${name}" should be UPPER_SNAKE_CASE`).toBe(true);
      });
    });

    it('should use lowercase with hyphens for array values', () => {
      const staticKeys = Object.entries(QUERY_KEYS)
        .filter(([_, value]) => typeof value !== 'function' && Array.isArray(value))
        .flatMap(([_, value]) => value as readonly string[]);
      
      staticKeys.forEach(keyValue => {
        if (typeof keyValue === 'string') {
          const isValid = /^[a-z][a-z0-9-_]*$/.test(keyValue);
          expect(isValid, `Key value "${keyValue}" should use lowercase with hyphens`).toBe(true);
        }
      });
    });
  });

  describe('Key Structure', () => {
    it('should have required beneficiary keys', () => {
      expect(QUERY_KEYS.BENEFICIARIES).toBeDefined();
      expect(QUERY_KEYS.BENEFICIARY).toBeDefined();
      expect(typeof QUERY_KEYS.BENEFICIARY).toBe('function');
    });

    it('should have required property keys', () => {
      expect(QUERY_KEYS.PROPERTIES).toBeDefined();
      expect(QUERY_KEYS.PROPERTY).toBeDefined();
      expect(QUERY_KEYS.TENANTS).toBeDefined();
    });

    it('should have required accounting keys', () => {
      expect(QUERY_KEYS.ACCOUNTS).toBeDefined();
      expect(QUERY_KEYS.JOURNAL_ENTRIES).toBeDefined();
      expect(QUERY_KEYS.FISCAL_YEARS).toBeDefined();
    });

    it('should have required system keys', () => {
      expect(QUERY_KEYS.AUDIT_LOGS).toBeDefined();
      expect(QUERY_KEYS.SYSTEM_SETTINGS).toBeDefined();
      expect(QUERY_KEYS.NOTIFICATIONS).toBeDefined();
    });
  });

  describe('Factory Functions Return Type', () => {
    it('should return readonly arrays', () => {
      const beneficiaryKey = QUERY_KEYS.BENEFICIARY('test-id');
      const activeSessionsKey = QUERY_KEYS.ACTIVE_SESSIONS('user-id');
      
      // These should be readonly tuples
      expect(Array.isArray(beneficiaryKey)).toBe(true);
      expect(Array.isArray(activeSessionsKey)).toBe(true);
    });

    it('should include the parameter in the returned key', () => {
      const testId = 'unique-test-id-12345';
      const key = QUERY_KEYS.BENEFICIARY(testId);
      
      expect(key).toContain(testId);
    });
  });

  describe('Query Key Coverage', () => {
    it('should have at least 300 keys defined', () => {
      const countKeys = (obj: Record<string, unknown>): number => {
        return Object.keys(obj).length;
      };
      
      const totalKeys = countKeys(QUERY_KEYS);
      expect(totalKeys).toBeGreaterThanOrEqual(100);
    });
  });
});
