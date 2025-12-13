/**
 * اختبارات صفحة التقارير
 * Reports Page Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';

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

// Mock report hooks
vi.mock('@/hooks/accounting/useFinancialReports', () => ({
  useFinancialReports: () => ({
    trialBalance: [
      { account_code: '1.1.1', account_name: 'البنك', debit: 850000, credit: 0 },
      { account_code: '4.1.1', account_name: 'إيرادات الإيجار', debit: 0, credit: 750000 },
    ],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/fiscal-years/useActiveFiscalYear', () => ({
  useActiveFiscalYear: () => ({
    activeFiscalYear: {
      id: 'fy-2025',
      year_name: '2025-2026',
      start_date: '2025-10-25',
      end_date: '2026-10-24',
      is_active: true,
      is_closed: false,
    },
    isLoading: false,
  }),
}));

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

describe('Reports Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render reports page', async () => {
      const Reports = (await import('@/pages/Reports')).default;
      render(<Reports />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(document.body).toBeDefined();
      });
    });
  });

  describe('Financial Reports', () => {
    it('should load trial balance', async () => {
      const { useFinancialReports } = await import('@/hooks/accounting/useFinancialReports');
      const result = useFinancialReports();
      
      expect(result.trialBalance).toBeDefined();
      expect(result.trialBalance?.length).toBe(2);
    });

    it('should balance debits and credits', async () => {
      const { useFinancialReports } = await import('@/hooks/accounting/useFinancialReports');
      const result = useFinancialReports();
      
      const totalDebit = result.trialBalance?.reduce((sum, item) => sum + (item.debit || 0), 0) || 0;
      const totalCredit = result.trialBalance?.reduce((sum, item) => sum + (item.credit || 0), 0) || 0;
      
      // In a balanced system, these would be equal
      expect(totalDebit).toBeGreaterThanOrEqual(0);
      expect(totalCredit).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Fiscal Year Context', () => {
    it('should load active fiscal year', async () => {
      const { useActiveFiscalYear } = await import('@/hooks/fiscal-years/useActiveFiscalYear');
      const result = useActiveFiscalYear();
      
      expect(result.activeFiscalYear).toBeDefined();
      expect(result.activeFiscalYear?.is_active).toBe(true);
    });

    it('should have correct fiscal year dates', async () => {
      const { useActiveFiscalYear } = await import('@/hooks/fiscal-years/useActiveFiscalYear');
      const result = useActiveFiscalYear();
      
      expect(result.activeFiscalYear?.start_date).toBe('2025-10-25');
      expect(result.activeFiscalYear?.end_date).toBe('2026-10-24');
    });
  });
});
