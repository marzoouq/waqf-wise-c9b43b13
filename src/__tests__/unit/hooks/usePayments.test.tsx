/**
 * اختبارات hook المدفوعات
 * Payments Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { usePayments } from '@/hooks/payments/usePayments';
import { clearMockTableData, setMockTableData } from '../../utils/supabase.mock';
import { mockPayments } from '../../utils/data.fixtures';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };
};

describe('usePayments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('fetching payments', () => {
    it('should return payments array', () => {
      setMockTableData('payments', mockPayments);

      const { result } = renderHook(() => usePayments(), {
        wrapper: createWrapper(),
      });

      expect(result.current.payments).toBeDefined();
      expect(Array.isArray(result.current.payments)).toBe(true);
    });

    it('should have loading state initially', () => {
      const { result } = renderHook(() => usePayments(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBeDefined();
    });
  });

  describe('mutations', () => {
    it('should have addPayment function', () => {
      const { result } = renderHook(() => usePayments(), {
        wrapper: createWrapper(),
      });

      expect(result.current.addPayment).toBeDefined();
      expect(typeof result.current.addPayment).toBe('function');
    });

    it('should have updatePayment function', () => {
      const { result } = renderHook(() => usePayments(), {
        wrapper: createWrapper(),
      });

      expect(result.current.updatePayment).toBeDefined();
      expect(typeof result.current.updatePayment).toBe('function');
    });

    it('should have deletePayment function', () => {
      const { result } = renderHook(() => usePayments(), {
        wrapper: createWrapper(),
      });

      expect(result.current.deletePayment).toBeDefined();
      expect(typeof result.current.deletePayment).toBe('function');
    });
  });

  describe('data structure', () => {
    it('should return payments as array', () => {
      setMockTableData('payments', mockPayments);

      const { result } = renderHook(() => usePayments(), {
        wrapper: createWrapper(),
      });

      expect(Array.isArray(result.current.payments)).toBe(true);
    });
  });
});
