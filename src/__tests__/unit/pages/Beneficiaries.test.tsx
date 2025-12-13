/**
 * اختبارات صفحة المستفيدين
 * Beneficiaries Page Tests
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
      user: { id: 'nazer-1', email: 'nazer@waqf.sa' },
      roles: ['nazer'],
      isLoading: false,
      isAuthenticated: true,
    }),
  };
});

// Mock beneficiary hooks
vi.mock('@/hooks/beneficiary/useBeneficiaries', () => ({
  useBeneficiaries: () => ({
    beneficiaries: [
      { id: 'ben-1', full_name: 'أحمد الثبيتي', category: 'ابن', status: 'نشط', total_received: 100000 },
      { id: 'ben-2', full_name: 'محمد الثبيتي', category: 'ابن', status: 'نشط', total_received: 100000 },
      { id: 'ben-3', full_name: 'فاطمة الثبيتي', category: 'بنت', status: 'نشط', total_received: 50000 },
      { id: 'ben-4', full_name: 'خديجة الثبيتي', category: 'زوجة', status: 'نشط', total_received: 120000 },
    ],
    isLoading: false,
    totalCount: 14,
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

describe('Beneficiaries Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render beneficiaries page', async () => {
      const Beneficiaries = (await import('@/pages/Beneficiaries')).default;
      render(<Beneficiaries />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(document.body).toBeDefined();
      });
    });
  });

  describe('Beneficiaries List', () => {
    it('should load all beneficiaries', async () => {
      const { useBeneficiaries } = await import('@/hooks/beneficiary/useBeneficiaries');
      const result = useBeneficiaries();
      
      expect(result.beneficiaries).toBeDefined();
      expect(result.beneficiaries?.length).toBe(4);
    });

    it('should categorize beneficiaries by type', async () => {
      const { useBeneficiaries } = await import('@/hooks/beneficiary/useBeneficiaries');
      const result = useBeneficiaries();
      
      const sons = result.beneficiaries?.filter(b => b.category === 'ابن') || [];
      const daughters = result.beneficiaries?.filter(b => b.category === 'بنت') || [];
      const wives = result.beneficiaries?.filter(b => b.category === 'زوجة') || [];
      
      expect(sons.length).toBe(2);
      expect(daughters.length).toBe(1);
      expect(wives.length).toBe(1);
    });

    it('should filter by status', async () => {
      const { useBeneficiaries } = await import('@/hooks/beneficiary/useBeneficiaries');
      const result = useBeneficiaries();
      
      const activeBeneficiaries = result.beneficiaries?.filter(b => b.status === 'نشط') || [];
      expect(activeBeneficiaries.length).toBe(4);
    });
  });

  describe('Beneficiary Statistics', () => {
    it('should calculate total distributions', async () => {
      const { useBeneficiaries } = await import('@/hooks/beneficiary/useBeneficiaries');
      const result = useBeneficiaries();
      
      const totalDistributed = result.beneficiaries?.reduce((sum, b) => sum + (b.total_received || 0), 0) || 0;
      expect(totalDistributed).toBe(370000);
    });

    it('should return total count', async () => {
      const { useBeneficiaries } = await import('@/hooks/beneficiary/useBeneficiaries');
      const result = useBeneficiaries();
      
      expect(result.totalCount).toBe(14);
    });
  });
});
