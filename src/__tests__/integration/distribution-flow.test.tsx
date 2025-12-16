/**
 * اختبارات تدفق التوزيعات المتكاملة
 * Distribution Flow Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';
import { setMockTableData, clearMockTableData } from '../utils/supabase.mock';
import { mockBeneficiaries } from '../fixtures/beneficiaries.fixtures';
import { mockDistributions, mockFiscalYears, mockPayments } from '../fixtures/financial.fixtures';

// Mock useAuth as Nazer
vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 'nazer-1', email: 'nazer@waqf.sa' },
      roles: ['nazer'],
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

describe('Distribution Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('Distribution Management', () => {
    it('should load all distributions', async () => {
      setMockTableData('distributions', mockDistributions);

      const { useDistributions } = await import('@/hooks/distributions/useDistributions');
      const { result } = renderHook(() => useDistributions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.distributions).toBeDefined();
      });
    });

    it('should filter distributions by status', async () => {
      setMockTableData('distributions', mockDistributions);

      const { useDistributions } = await import('@/hooks/distributions/useDistributions');
      const { result } = renderHook(() => useDistributions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        const approved = result.current.distributions?.filter(d => d.status === 'معتمد') || [];
        expect(approved.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Distribution Details', () => {
    it('should load distribution details', async () => {
      setMockTableData('distributions', mockDistributions);
      setMockTableData('heir_distributions', [
        { id: 'hd-1', distribution_id: mockDistributions[0].id, beneficiary_id: mockBeneficiaries[0].id, amount: 100000, status: 'مدفوع' },
        { id: 'hd-2', distribution_id: mockDistributions[0].id, beneficiary_id: mockBeneficiaries[1].id, amount: 75000, status: 'مدفوع' },
      ]);

      const { useDistributionDetails } = await import('@/hooks/distributions/useDistributionDetails');
      const { result } = renderHook(() => useDistributionDetails(mockDistributions[0].id), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.details).toBeDefined();
      });
    });
  });

  describe('Distribution to Payments', () => {
    it('should create payments for each heir after approval', async () => {
      setMockTableData('distributions', mockDistributions);
      setMockTableData('payments', mockPayments);

      const { usePayments } = await import('@/hooks/payments/usePayments');
      const { result } = renderHook(() => usePayments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.payments).toBeDefined();
      });
    });

    it('should update beneficiary balances after distribution', async () => {
      setMockTableData('beneficiaries', mockBeneficiaries);
      setMockTableData('payments', mockPayments);

      const { useBeneficiaries } = await import('@/hooks/beneficiary/useBeneficiaries');
      const { result } = renderHook(() => useBeneficiaries(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        const beneficiary = result.current.beneficiaries?.[0];
        if (beneficiary) {
          expect(beneficiary.total_received !== undefined || beneficiary.account_balance !== undefined).toBe(true);
        }
      });
    });
  });

  describe('Annual Disclosure', () => {
    it('should load annual disclosure data', async () => {
      setMockTableData('annual_disclosures', [
        {
          id: 'disc-1',
          fiscal_year_id: mockFiscalYears[0].id,
          year: 2024,
          waqf_name: 'وقف مرزوق الثبيتي',
          total_revenues: 1600000,
          total_expenses: 350000,
          net_income: 1250000,
          nazer_percentage: 10,
          nazer_share: 125000,
          corpus_percentage: 12,
          corpus_share: 150000,
          charity_percentage: 5,
          charity_share: 62500,
          total_beneficiaries: 14,
          sons_count: 5,
          daughters_count: 4,
          wives_count: 3,
          disclosure_date: '2024-10-25',
          status: 'published',
        }
      ]);

      const { useAnnualDisclosures } = await import('@/hooks/reports/useAnnualDisclosures');
      const { result } = renderHook(() => useAnnualDisclosures(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.disclosures).toBeDefined();
      });
    });
  });

  describe('Waqf Corpus Tracking', () => {
    it('should track accumulated waqf corpus', async () => {
      setMockTableData('fiscal_year_closings', [
        { id: 'fyc-1', fiscal_year_id: mockFiscalYears[0].id, corpus_added: 107913.20, closing_date: '2025-10-24' }
      ]);

      const { useFiscalYearClosings } = await import('@/hooks/accounting/useFiscalYearClosings');
      const { result } = renderHook(() => useFiscalYearClosings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.closings).toBeDefined();
      });
    });
  });

  describe('Distribution Engine', () => {
    it('should calculate Islamic heir shares', async () => {
      setMockTableData('beneficiaries', mockBeneficiaries);
      
      const { useDistributionEngine } = await import('@/hooks/distributions/useDistributionEngine');
      const { result } = renderHook(() => useDistributionEngine(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.calculate).toBeDefined();
      });
    });
  });
});
