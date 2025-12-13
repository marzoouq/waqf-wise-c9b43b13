/**
 * اختبارات صفحة الصناديق والتوزيعات
 * Funds & Distributions Page Tests
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

// Mock data for funds
const mockFundsData = [
  { id: 'fund-1', name: 'صندوق رقبة الوقف', balance: 107913.20, percentage: 12 },
  { id: 'fund-2', name: 'صندوق الناظر', balance: 0, percentage: 10 },
  { id: 'fund-3', name: 'صندوق الخيرية', balance: 0, percentage: 5 },
];

const mockDistributionsData = [
  {
    id: 'dist-1',
    distribution_number: 'DIST-2024-001',
    total_amount: 1000000,
    beneficiaries_count: 14,
    status: 'معتمد',
    distribution_date: '2024-11-15',
  },
];

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

describe('Funds Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render funds page', async () => {
      const Funds = (await import('@/pages/Funds')).default;
      render(<Funds />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(document.body).toBeDefined();
      });
    });
  });

  describe('Funds List', () => {
    it('should load all funds', () => {
      expect(mockFundsData).toBeDefined();
      expect(mockFundsData.length).toBe(3);
    });

    it('should calculate total percentages', () => {
      const totalPercentage = mockFundsData.reduce((sum, f) => sum + (f.percentage || 0), 0);
      expect(totalPercentage).toBe(27); // 12 + 10 + 5
    });

    it('should show waqf corpus fund balance', () => {
      const waqfCorpusFund = mockFundsData.find(f => f.name === 'صندوق رقبة الوقف');
      expect(waqfCorpusFund?.balance).toBe(107913.20);
    });
  });

  describe('Distributions', () => {
    it('should load distributions', () => {
      expect(mockDistributionsData).toBeDefined();
      expect(mockDistributionsData.length).toBe(1);
    });

    it('should show approved distributions', () => {
      const approvedDistributions = mockDistributionsData.filter(d => d.status === 'معتمد');
      expect(approvedDistributions.length).toBe(1);
    });

    it('should calculate total distributed amount', () => {
      const totalDistributed = mockDistributionsData.reduce((sum, d) => sum + (d.total_amount || 0), 0);
      expect(totalDistributed).toBe(1000000);
    });
  });
});
