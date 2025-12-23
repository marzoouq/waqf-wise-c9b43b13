/**
 * Financial & Accounting Integration Tests - اختبارات المالية والمحاسبة
 * @phase 4 - Accounting & Finance
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import {
  realAccounts,
  mockAccounts,
  realPayments,
  mockPayments,
  realJournalEntries,
  mockJournalEntries,
  realJournalEntryLines,
  realFiscalYears,
  mockFiscalYears,
  realDistributions,
  mockDistributions,
  realHeirDistributions,
  financialStats,
  getAccountByCode,
  getActivePayments,
  getJournalEntriesByFiscalYear,
  getActiveFiscalYear,
  getDistributionsByFiscalYear,
} from '../../fixtures/financial.fixtures';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: mockAccounts, error: null })),
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockAccounts[0], error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: { id: 'new-entry' }, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: mockAccounts[0], error: null })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-accountant', role: 'accountant' } }, 
        error: null 
      })),
    },
  },
}));

describe('Chart of Accounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Accounts Listing', () => {
    it('should have accounts defined', () => {
      expect(realAccounts).toBeDefined();
      expect(Array.isArray(realAccounts)).toBe(true);
      expect(realAccounts.length).toBeGreaterThan(0);
    });

    it('should have required fields for each account', () => {
      realAccounts.forEach((acc) => {
        expect(acc).toHaveProperty('id');
        expect(acc).toHaveProperty('code');
        expect(acc).toHaveProperty('name_ar');
        expect(acc).toHaveProperty('account_type');
        expect(acc).toHaveProperty('account_nature');
      });
    });

    it('should have account types', () => {
      const types = [...new Set(realAccounts.map((a) => a.account_type))];
      expect(types).toContain('asset');
      expect(types).toContain('liability');
      expect(types).toContain('revenue');
      expect(types).toContain('expense');
    });

    it('should have account natures', () => {
      const natures = [...new Set(realAccounts.map((a) => a.account_nature))];
      expect(natures).toContain('debit');
      expect(natures).toContain('credit');
    });
  });

  describe('Account Helper Functions', () => {
    it('should get account by code', () => {
      const bankAccount = getAccountByCode('1.1.1');
      expect(bankAccount).toBeDefined();
      expect(bankAccount?.name_ar).toBe('البنك');
    });

    it('should return undefined for non-existent code', () => {
      const account = getAccountByCode('9.9.9');
      expect(account).toBeUndefined();
    });
  });

  describe('Account Balances', () => {
    it('should have current balance for each account', () => {
      realAccounts.forEach((acc) => {
        expect(acc.current_balance).toBeDefined();
        expect(typeof acc.current_balance).toBe('number');
      });
    });

    it('should have correct bank balance', () => {
      const bankAccount = getAccountByCode('1.1.1');
      expect(bankAccount?.current_balance).toBe(financialStats.bankBalance);
    });
  });
});

describe('Payments', () => {
  describe('Payments Listing', () => {
    it('should have payments defined', () => {
      expect(realPayments).toBeDefined();
      expect(Array.isArray(realPayments)).toBe(true);
    });

    it('should have required payment fields', () => {
      realPayments.forEach((payment) => {
        expect(payment).toHaveProperty('id');
        expect(payment).toHaveProperty('payment_number');
        expect(payment).toHaveProperty('amount');
        expect(payment).toHaveProperty('payment_type');
        expect(payment).toHaveProperty('status');
      });
    });

    it('should have rental payments', () => {
      const rentalPayments = realPayments.filter((p) => p.payment_type === 'إيجار');
      expect(rentalPayments.length).toBeGreaterThan(0);
    });

    it('should calculate tax correctly', () => {
      realPayments.forEach((payment) => {
        expect(payment.tax_amount).toBeDefined();
        expect(payment.net_amount).toBeDefined();
        expect(payment.amount).toBe(payment.tax_amount + payment.net_amount);
      });
    });
  });

  describe('Active Payments', () => {
    it('should get only paid payments', () => {
      const active = getActivePayments();
      active.forEach((payment) => {
        expect(payment.status).toBe('مدفوع');
      });
    });
  });
});

describe('Journal Entries', () => {
  describe('Journal Entries Listing', () => {
    it('should have journal entries defined', () => {
      expect(realJournalEntries).toBeDefined();
      expect(Array.isArray(realJournalEntries)).toBe(true);
    });

    it('should have required fields', () => {
      realJournalEntries.forEach((je) => {
        expect(je).toHaveProperty('id');
        expect(je).toHaveProperty('entry_number');
        expect(je).toHaveProperty('entry_date');
        expect(je).toHaveProperty('description');
        expect(je).toHaveProperty('total_debit');
        expect(je).toHaveProperty('total_credit');
        expect(je).toHaveProperty('status');
      });
    });

    it('should have balanced entries', () => {
      realJournalEntries.forEach((je) => {
        expect(je.total_debit).toBe(je.total_credit);
      });
    });

    it('should have posted entries', () => {
      const posted = realJournalEntries.filter((je) => je.status === 'مرحل');
      expect(posted.length).toBeGreaterThan(0);
    });
  });

  describe('Journal Entry Lines', () => {
    it('should have entry lines defined', () => {
      expect(realJournalEntryLines).toBeDefined();
      expect(Array.isArray(realJournalEntryLines)).toBe(true);
    });

    it('should have required line fields', () => {
      realJournalEntryLines.forEach((line) => {
        expect(line).toHaveProperty('id');
        expect(line).toHaveProperty('journal_entry_id');
        expect(line).toHaveProperty('account_id');
        expect(line).toHaveProperty('debit');
        expect(line).toHaveProperty('credit');
      });
    });

    it('should have either debit or credit', () => {
      realJournalEntryLines.forEach((line) => {
        const hasDebit = line.debit > 0;
        const hasCredit = line.credit > 0;
        expect(hasDebit || hasCredit).toBe(true);
        expect(hasDebit && hasCredit).toBe(false);
      });
    });
  });

  describe('Journal Entries by Fiscal Year', () => {
    it('should get entries by fiscal year', () => {
      const entries = getJournalEntriesByFiscalYear('fy-2025');
      entries.forEach((je) => {
        expect(je.fiscal_year_id).toBe('fy-2025');
      });
    });
  });
});

describe('Fiscal Years', () => {
  describe('Fiscal Years Listing', () => {
    it('should have fiscal years defined', () => {
      expect(realFiscalYears).toBeDefined();
      expect(Array.isArray(realFiscalYears)).toBe(true);
    });

    it('should have required fields', () => {
      realFiscalYears.forEach((fy) => {
        expect(fy).toHaveProperty('id');
        expect(fy).toHaveProperty('year_name');
        expect(fy).toHaveProperty('start_date');
        expect(fy).toHaveProperty('end_date');
        expect(fy).toHaveProperty('is_closed');
        expect(fy).toHaveProperty('is_active');
      });
    });

    it('should have only one active fiscal year', () => {
      const activeYears = realFiscalYears.filter((fy) => fy.is_active);
      expect(activeYears.length).toBeLessThanOrEqual(1);
    });

    it('should get active fiscal year', () => {
      const active = getActiveFiscalYear();
      if (active) {
        expect(active.is_active).toBe(true);
      }
    });
  });

  describe('Fiscal Year Financials', () => {
    it('should have financial summary', () => {
      realFiscalYears.forEach((fy) => {
        expect(fy).toHaveProperty('total_revenues');
        expect(fy).toHaveProperty('total_expenses');
        expect(fy).toHaveProperty('net_income');
      });
    });

    it('should calculate net income correctly', () => {
      realFiscalYears.forEach((fy) => {
        expect(fy.net_income).toBe(fy.total_revenues - fy.total_expenses);
      });
    });
  });
});

describe('Distributions', () => {
  describe('Distributions Listing', () => {
    it('should have distributions defined', () => {
      expect(realDistributions).toBeDefined();
      expect(Array.isArray(realDistributions)).toBe(true);
    });

    it('should have required fields', () => {
      realDistributions.forEach((dist) => {
        expect(dist).toHaveProperty('id');
        expect(dist).toHaveProperty('distribution_number');
        expect(dist).toHaveProperty('distribution_date');
        expect(dist).toHaveProperty('total_amount');
        expect(dist).toHaveProperty('beneficiaries_count');
        expect(dist).toHaveProperty('status');
      });
    });

    it('should have approved distributions', () => {
      const approved = realDistributions.filter((d) => d.status === 'معتمد');
      expect(approved.length).toBeGreaterThan(0);
    });
  });

  describe('Heir Distributions', () => {
    it('should have heir distributions defined', () => {
      expect(realHeirDistributions).toBeDefined();
      expect(Array.isArray(realHeirDistributions)).toBe(true);
    });

    it('should have required fields', () => {
      realHeirDistributions.forEach((hd) => {
        expect(hd).toHaveProperty('id');
        expect(hd).toHaveProperty('distribution_id');
        expect(hd).toHaveProperty('beneficiary_id');
        expect(hd).toHaveProperty('heir_type');
        expect(hd).toHaveProperty('amount');
        expect(hd).toHaveProperty('status');
      });
    });

    it('should link to distributions', () => {
      realHeirDistributions.forEach((hd) => {
        const dist = realDistributions.find((d) => d.id === hd.distribution_id);
        expect(dist).toBeDefined();
      });
    });
  });

  describe('Distribution by Fiscal Year', () => {
    it('should get distributions by fiscal year', () => {
      const distributions = getDistributionsByFiscalYear('fy-2024');
      distributions.forEach((d) => {
        expect(d.fiscal_year_id).toBe('fy-2024');
      });
    });
  });
});

describe('Financial Statistics', () => {
  it('should have correct bank balance', () => {
    expect(financialStats.bankBalance).toBe(850000);
  });

  it('should have waqf corpus', () => {
    expect(financialStats.waqfCorpus).toBeDefined();
    expect(typeof financialStats.waqfCorpus).toBe('number');
  });

  it('should calculate total collected rent', () => {
    const expected = realPayments.reduce((sum, p) => sum + p.amount, 0);
    expect(financialStats.totalCollectedRent).toBe(expected);
  });

  it('should calculate total VAT', () => {
    const expected = realPayments.reduce((sum, p) => sum + p.tax_amount, 0);
    expect(financialStats.totalVAT).toBe(expected);
  });

  it('should calculate total net revenue', () => {
    const expected = realPayments.reduce((sum, p) => sum + p.net_amount, 0);
    expect(financialStats.totalNetRevenue).toBe(expected);
  });

  it('should calculate total distributed', () => {
    const expected = realDistributions.reduce((sum, d) => sum + d.total_amount, 0);
    expect(financialStats.totalDistributed).toBe(expected);
  });
});
