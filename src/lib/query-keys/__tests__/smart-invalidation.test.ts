/**
 * Smart Invalidation Tests v1.1.0
 * - Conditional Invalidation tests
 * - Debouncing tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAffectedKeys, cancelPendingInvalidations } from '../smart-invalidation';

describe('Smart Invalidation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cancelPendingInvalidations();
    vi.useRealTimers();
  });

  describe('getAffectedKeys - Basic', () => {
    it('should return the trigger key itself', () => {
      const affected = getAffectedKeys('BANK_TRANSACTIONS');
      expect(affected).toContain('BANK_TRANSACTIONS');
    });

    it('should return only trigger key if no rules match', () => {
      const affected = getAffectedKeys('USERS');
      expect(affected).toEqual(['USERS']);
    });

    it('should not duplicate keys', () => {
      const affected = getAffectedKeys('RENTAL_PAYMENTS');
      const uniqueKeys = new Set(affected);
      expect(uniqueKeys.size).toBe(affected.length);
    });
  });

  describe('getAffectedKeys - Conditional Invalidation', () => {
    it('should include UNIFIED_KPIS for active beneficiaries', () => {
      const affected = getAffectedKeys('BENEFICIARIES', { status: 'نشط' });
      expect(affected).toContain('UNIFIED_KPIS');
    });

    it('should skip UNIFIED_KPIS for inactive beneficiaries', () => {
      const affected = getAffectedKeys('BENEFICIARIES', { status: 'غير نشط' });
      expect(affected).not.toContain('UNIFIED_KPIS');
    });

    it('should include UNIFIED_KPIS for new beneficiaries', () => {
      const affected = getAffectedKeys('BENEFICIARIES', { isNew: true });
      expect(affected).toContain('UNIFIED_KPIS');
    });

    it('should include keys for CONTRACTS with active status', () => {
      const affected = getAffectedKeys('CONTRACTS', { status: 'نشط' });
      expect(affected).toContain('PROPERTIES_STATS');
      expect(affected).toContain('UNIFIED_KPIS');
    });

    it('should skip keys for CONTRACTS with draft status', () => {
      const affected = getAffectedKeys('CONTRACTS', { status: 'مسودة' });
      expect(affected).not.toContain('PROPERTIES_STATS');
    });

    it('should include TRIAL_BALANCE for approved journal entries', () => {
      const affected = getAffectedKeys('JOURNAL_ENTRIES', { status: 'approved' });
      expect(affected).toContain('TRIAL_BALANCE');
      expect(affected).toContain('ACCOUNTS_WITH_BALANCES');
    });

    it('should skip TRIAL_BALANCE for draft journal entries', () => {
      const affected = getAffectedKeys('JOURNAL_ENTRIES', { status: 'draft' });
      expect(affected).not.toContain('TRIAL_BALANCE');
    });

    it('should include UNIFIED_KPIS for maintenance with statusChanged', () => {
      const affected = getAffectedKeys('MAINTENANCE_REQUESTS', { statusChanged: true });
      expect(affected).toContain('UNIFIED_KPIS');
    });

    it('should skip UNIFIED_KPIS for maintenance without statusChanged', () => {
      const affected = getAffectedKeys('MAINTENANCE_REQUESTS', { statusChanged: false });
      expect(affected).not.toContain('UNIFIED_KPIS');
    });

    it('should include keys for completed distributions', () => {
      const affected = getAffectedKeys('DISTRIBUTIONS', { status: 'completed' });
      expect(affected).toContain('BENEFICIARIES');
      expect(affected).toContain('UNIFIED_KPIS');
    });

    it('should skip keys for pending distributions', () => {
      const affected = getAffectedKeys('DISTRIBUTIONS', { status: 'pending' });
      expect(affected).not.toContain('BENEFICIARIES');
    });

    it('should include UNIFIED_KPIS for active tenants', () => {
      const affected = getAffectedKeys('TENANTS', { status: 'active' });
      expect(affected).toContain('UNIFIED_KPIS');
    });

    it('should skip UNIFIED_KPIS for inactive tenants', () => {
      const affected = getAffectedKeys('TENANTS', { status: 'inactive' });
      expect(affected).not.toContain('UNIFIED_KPIS');
    });
  });

  describe('Rules without conditions', () => {
    it('should always include BANK_ACCOUNTS for BANK_TRANSACTIONS', () => {
      const affected = getAffectedKeys('BANK_TRANSACTIONS');
      expect(affected).toContain('BANK_ACCOUNTS');
    });

    it('should always include AUDIT_ALERTS for AUDIT_LOGS', () => {
      const affected = getAffectedKeys('AUDIT_LOGS');
      expect(affected).toContain('AUDIT_ALERTS');
    });

    it('should always include AGING_REPORT for LOANS', () => {
      const affected = getAffectedKeys('LOANS');
      expect(affected).toContain('AGING_REPORT');
    });

    it('should always include COLLECTION_STATS for RENTAL_PAYMENTS', () => {
      const affected = getAffectedKeys('RENTAL_PAYMENTS');
      expect(affected).toContain('COLLECTION_STATS');
    });
  });
});
