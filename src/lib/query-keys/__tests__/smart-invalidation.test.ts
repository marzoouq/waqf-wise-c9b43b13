import { describe, it, expect, vi } from 'vitest';
import { getAffectedKeys } from '../smart-invalidation';

describe('Smart Invalidation', () => {
  describe('getAffectedKeys', () => {
    it('should return the trigger key itself', () => {
      const affected = getAffectedKeys('BENEFICIARIES');
      expect(affected).toContain('BENEFICIARIES');
    });

    it('should return affected keys for BENEFICIARIES', () => {
      const affected = getAffectedKeys('BENEFICIARIES');
      expect(affected).toContain('UNIFIED_KPIS');
    });

    it('should return affected keys for CONTRACTS', () => {
      const affected = getAffectedKeys('CONTRACTS');
      expect(affected).toContain('PROPERTIES_STATS');
      expect(affected).toContain('RENTAL_PAYMENTS');
      expect(affected).toContain('UNIFIED_KPIS');
    });

    it('should return affected keys for JOURNAL_ENTRIES', () => {
      const affected = getAffectedKeys('JOURNAL_ENTRIES');
      expect(affected).toContain('TRIAL_BALANCE');
      expect(affected).toContain('ACCOUNTS_WITH_BALANCES');
    });

    it('should return only the trigger key if no rules match', () => {
      const affected = getAffectedKeys('USERS');
      expect(affected).toEqual(['USERS']);
    });

    it('should not duplicate keys', () => {
      const affected = getAffectedKeys('BENEFICIARIES');
      const uniqueKeys = new Set(affected);
      expect(uniqueKeys.size).toBe(affected.length);
    });
  });
});
