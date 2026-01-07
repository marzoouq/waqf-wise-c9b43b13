/**
 * اختبارات Hooks المحاسبة - مبسطة
 */

import { describe, it, expect } from 'vitest';

describe('Accounting Hooks', () => {
  it('useAccounts should be importable', async () => {
    const module = await import('@/hooks/accounting/useAccounts');
    expect(module.useAccounts).toBeDefined();
  });

  it('useAddAccount should be importable', async () => {
    const module = await import('@/hooks/accounting/useAddAccount');
    expect(module.useAddAccount).toBeDefined();
  });

  it('useJournalEntries should be importable', async () => {
    const module = await import('@/hooks/accounting/useJournalEntries');
    expect(module.useJournalEntries).toBeDefined();
  });

  it('useAddJournalEntry should be importable', async () => {
    const module = await import('@/hooks/accounting/useAddJournalEntry');
    expect(module.useAddJournalEntry).toBeDefined();
  });

  it('useFiscalYears should be importable', async () => {
    const module = await import('@/hooks/accounting/useFiscalYears');
    expect(module.useFiscalYears).toBeDefined();
  });

  it('useGeneralLedger should be importable', async () => {
    const module = await import('@/hooks/accounting/useGeneralLedger');
    expect(module.useGeneralLedger).toBeDefined();
  });

  it('useBudgets should be importable', async () => {
    const module = await import('@/hooks/accounting/useBudgets');
    expect(module.useBudgets).toBeDefined();
  });

  it('useCashFlows should be importable', async () => {
    const module = await import('@/hooks/accounting/useCashFlows');
    expect(module.useCashFlows).toBeDefined();
  });

  it('useFinancialReports should be importable', async () => {
    const module = await import('@/hooks/accounting/useFinancialReports');
    expect(module.useFinancialReports).toBeDefined();
  });

  it('useApprovalWorkflow should be importable', async () => {
    const module = await import('@/hooks/accounting/useApprovalWorkflow');
    expect(module.useApprovalWorkflow).toBeDefined();
  });
});
