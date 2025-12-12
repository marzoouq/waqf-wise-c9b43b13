/**
 * اختبارات hook القروض
 * Loans Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useLoans } from '@/hooks/payments/useLoans';
import { clearMockTableData, setMockTableData } from '../../utils/supabase.mock';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  };
};

const mockLoans = [
  {
    id: 'loan-1',
    beneficiary_id: 'ben-1',
    amount: 50000,
    remaining_amount: 25000,
    status: 'نشط',
  },
];

describe('useLoans', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('fetching loans', () => {
    it('should return loans array', () => {
      setMockTableData('loans', mockLoans);

      const { result } = renderHook(() => useLoans(), {
        wrapper: createWrapper(),
      });

      expect(result.current.loans).toBeDefined();
      expect(Array.isArray(result.current.loans)).toBe(true);
    });

    it('should have loading state', () => {
      const { result } = renderHook(() => useLoans(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBeDefined();
    });
  });

  describe('mutations', () => {
    it('should have addLoan function', () => {
      const { result } = renderHook(() => useLoans(), {
        wrapper: createWrapper(),
      });

      expect(result.current.addLoan).toBeDefined();
    });

    it('should have updateLoan function', () => {
      const { result } = renderHook(() => useLoans(), {
        wrapper: createWrapper(),
      });

      expect(result.current.updateLoan).toBeDefined();
    });
  });
});
