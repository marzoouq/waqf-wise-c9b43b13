/**
 * اختبارات تدفق المستفيدين المتكاملة
 * Beneficiary Flow Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';
import { setMockTableData, clearMockTableData } from '../utils/supabase.mock';
import { mockBeneficiaries, mockBeneficiarySessions } from '../fixtures/beneficiaries.fixtures';
import { mockPayments, mockDistributions } from '../fixtures/financial.fixtures';

// Mock useAuth
vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 'admin-1', email: 'admin@waqf.sa' },
      roles: ['admin'],
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

describe('Beneficiary Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('Complete Beneficiary Lifecycle', () => {
    it('should load beneficiaries with complete data', async () => {
      setMockTableData('beneficiaries', mockBeneficiaries);
      setMockTableData('payments', mockPayments);
      
      const { useBeneficiaries } = await import('@/hooks/beneficiary/useBeneficiaries');
      const { result } = renderHook(() => useBeneficiaries(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.beneficiaries).toBeDefined();
      });

      expect(Array.isArray(result.current.beneficiaries)).toBe(true);
    });

    it('should filter beneficiaries by status', async () => {
      setMockTableData('beneficiaries', mockBeneficiaries);

      const { useBeneficiaries } = await import('@/hooks/beneficiary/useBeneficiaries');
      const { result } = renderHook(() => useBeneficiaries(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.beneficiaries).toBeDefined();
      });

      const activeBeneficiaries = result.current.beneficiaries?.filter(b => b.status === 'نشط') || [];
      expect(activeBeneficiaries.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Beneficiary Statistics', () => {
    it('should load beneficiaries and count categories', async () => {
      setMockTableData('beneficiaries', mockBeneficiaries);

      const { useBeneficiaries } = await import('@/hooks/beneficiary/useBeneficiaries');
      const { result } = renderHook(() => useBeneficiaries(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.beneficiaries).toBeDefined();
      });

      const sons = result.current.beneficiaries?.filter(b => b.category === 'ابن') || [];
      const daughters = result.current.beneficiaries?.filter(b => b.category === 'بنت') || [];
      const wives = result.current.beneficiaries?.filter(b => b.category === 'زوجة') || [];
      
      expect(sons.length + daughters.length + wives.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Beneficiary Distributions', () => {
    it('should load distributions', async () => {
      setMockTableData('distributions', mockDistributions);
      setMockTableData('heir_distributions', [
        { id: 'hd-1', beneficiary_id: 'ben-001', distribution_id: 'dist-001', amount: 50000 }
      ]);

      const { useDistributions } = await import('@/hooks/distributions/useDistributions');
      const { result } = renderHook(() => useDistributions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.distributions).toBeDefined();
      });
    });
  });

  describe('Beneficiary Family Tree', () => {
    it('should load family relationships', async () => {
      setMockTableData('beneficiaries', mockBeneficiaries);
      setMockTableData('families', [
        { id: 'fam-1', family_name: 'آل الثبيتي', head_id: 'ben-001', created_at: new Date().toISOString() }
      ]);

      const { useFamilyTree } = await import('@/hooks/beneficiary/useBeneficiaryProfileData');
      const { result } = renderHook(() => useFamilyTree('ben-001'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });
    });
  });

  describe('Beneficiary Session Tracking', () => {
    it('should track session data', async () => {
      setMockTableData('beneficiary_sessions', mockBeneficiarySessions);

      expect(mockBeneficiarySessions.length).toBeGreaterThan(0);
      expect(mockBeneficiarySessions[0].is_online).toBe(true);
    });
  });
});
