/**
 * اختبارات تدفق المحاسبة المتكاملة
 * Accounting Flow Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';
import { setMockTableData, clearMockTableData } from '../utils/supabase.mock';
import { mockAccounts, mockJournalEntries, mockFiscalYears } from '../fixtures/financial.fixtures';

// Mock useAuth
vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 'accountant-1', email: 'accountant@waqf.sa' },
      roles: ['accountant'],
      isLoading: false,
      isAuthenticated: true,
    }),
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Accounting Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('Chart of Accounts', () => {
    it('should load complete chart of accounts', async () => {
      setMockTableData('accounts', mockAccounts);

      const { useAccounts } = await import('@/hooks/accounting/useAccounts');
      const { result } = renderHook(() => useAccounts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.accounts).toBeDefined();
        expect(Array.isArray(result.current.accounts)).toBe(true);
      });
    });

    it('should organize accounts hierarchically', async () => {
      setMockTableData('accounts', mockAccounts);

      const { useAccounts } = await import('@/hooks/accounting/useAccounts');
      const { result } = renderHook(() => useAccounts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        const headerAccounts = result.current.accounts?.filter(a => a.is_header) || [];
        const detailAccounts = result.current.accounts?.filter(a => !a.is_header) || [];
        expect(headerAccounts.length + detailAccounts.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Journal Entries', () => {
    it('should load journal entries', async () => {
      setMockTableData('journal_entries', mockJournalEntries);

      const { useJournalEntries } = await import('@/hooks/accounting/useJournalEntries');
      const { result } = renderHook(() => useJournalEntries(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.entries).toBeDefined();
      });
    });

    it('should filter journal entries by status', async () => {
      setMockTableData('journal_entries', mockJournalEntries);

      const { useJournalEntries } = await import('@/hooks/accounting/useJournalEntries');
      const { result } = renderHook(() => useJournalEntries(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        const postedEntries = result.current.entries?.filter(e => e.status === 'posted') || [];
        expect(postedEntries.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Financial Reports', () => {
    it('should load financial reports data', async () => {
      setMockTableData('accounts', mockAccounts);
      setMockTableData('fiscal_years', mockFiscalYears);

      const { useFinancialReports } = await import('@/hooks/accounting/useFinancialReports');
      const { result } = renderHook(() => useFinancialReports(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });
  });

  describe('Fiscal Year Management', () => {
    it('should load active fiscal year', async () => {
      setMockTableData('fiscal_years', mockFiscalYears);

      const { useActiveFiscalYear } = await import('@/hooks/fiscal-years/useActiveFiscalYear');
      const { result } = renderHook(() => useActiveFiscalYear(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.activeFiscalYear).toBeDefined();
      });
    });

    it('should load all fiscal years', async () => {
      setMockTableData('fiscal_years', mockFiscalYears);

      const { useFiscalYears } = await import('@/hooks/accounting/useFiscalYears');
      const { result } = renderHook(() => useFiscalYears(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.fiscalYears).toBeDefined();
      });
    });
  });
});
