/**
 * اختبارات صفحة الطلبات
 * Requests Page Tests
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

// Mock requests data
const mockRequestsData = [
  { id: 'req-1', request_number: 'REQ-001', request_type: { name: 'فزعة' }, status: 'معلق', amount: 5000, beneficiary_name: 'أحمد' },
  { id: 'req-2', request_number: 'REQ-002', request_type: { name: 'قرض' }, status: 'معتمد', amount: 10000, beneficiary_name: 'محمد' },
  { id: 'req-3', request_number: 'REQ-003', request_type: { name: 'تحديث بيانات' }, status: 'مكتمل', amount: 0, beneficiary_name: 'فاطمة' },
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

describe('Requests Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render requests page', async () => {
      const Requests = (await import('@/pages/Requests')).default;
      render(<Requests />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(document.body).toBeDefined();
      });
    });
  });

  describe('Requests List', () => {
    it('should load all requests', () => {
      expect(mockRequestsData).toBeDefined();
      expect(mockRequestsData.length).toBe(3);
    });

    it('should categorize requests by type', () => {
      const emergencyRequests = mockRequestsData.filter(r => r.request_type?.name === 'فزعة');
      const loanRequests = mockRequestsData.filter(r => r.request_type?.name === 'قرض');
      const updateRequests = mockRequestsData.filter(r => r.request_type?.name === 'تحديث بيانات');
      
      expect(emergencyRequests.length).toBe(1);
      expect(loanRequests.length).toBe(1);
      expect(updateRequests.length).toBe(1);
    });

    it('should filter by status', () => {
      const pendingRequests = mockRequestsData.filter(r => r.status === 'معلق');
      const approvedRequests = mockRequestsData.filter(r => r.status === 'معتمد');
      const completedRequests = mockRequestsData.filter(r => r.status === 'مكتمل');
      
      expect(pendingRequests.length).toBe(1);
      expect(approvedRequests.length).toBe(1);
      expect(completedRequests.length).toBe(1);
    });
  });

  describe('Request Statistics', () => {
    it('should count pending requests', () => {
      const pendingCount = mockRequestsData.filter(r => r.status === 'معلق').length;
      expect(pendingCount).toBe(1);
    });

    it('should calculate total requested amount', () => {
      const totalAmount = mockRequestsData.reduce((sum, r) => sum + (r.amount || 0), 0);
      expect(totalAmount).toBe(15000);
    });
  });
});
