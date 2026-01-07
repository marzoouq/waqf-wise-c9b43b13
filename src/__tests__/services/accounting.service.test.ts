/**
 * اختبارات خدمة المحاسبة
 */

import { describe, it, expect } from 'vitest';

describe('Accounting Service', () => {
  it('accounting service module should be importable', async () => {
    const module = await import('@/services/accounting.service');
    expect(module).toBeDefined();
  });

  it('should have AccountingService class', async () => {
    const { AccountingService } = await import('@/services/accounting.service');
    expect(AccountingService).toBeDefined();
  });

  it('should have getAccounts method', async () => {
    const { AccountingService } = await import('@/services/accounting.service');
    expect(typeof AccountingService.getAccounts).toBe('function');
  });

  it('should have getJournalEntries method', async () => {
    const { AccountingService } = await import('@/services/accounting.service');
    expect(typeof AccountingService.getJournalEntries).toBe('function');
  });

  it('should have createJournalEntry method', async () => {
    const { AccountingService } = await import('@/services/accounting.service');
    expect(typeof AccountingService.createJournalEntry).toBe('function');
  });

  it('should have getTrialBalance method', async () => {
    const { AccountingService } = await import('@/services/accounting.service');
    expect(typeof AccountingService.getTrialBalance).toBe('function');
  });

  it('should have getBudgets method', async () => {
    const { AccountingService } = await import('@/services/accounting.service');
    expect(typeof AccountingService.getBudgets).toBe('function');
  });

  it('should have getBalanceSheet method', async () => {
    const { AccountingService } = await import('@/services/accounting.service');
    expect(typeof AccountingService.getBalanceSheet).toBe('function');
  });
});
