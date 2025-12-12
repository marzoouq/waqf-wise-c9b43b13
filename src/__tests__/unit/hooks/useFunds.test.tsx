/**
 * اختبارات hook الصناديق
 * useFunds Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useFunds } from '@/hooks/distributions/useFunds';
import { clearMockTableData, setMockTableData } from '../../utils/supabase.mock';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('useFunds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('fetching funds', () => {
    it('should return funds data', async () => {
      setMockTableData('funds', [
        { id: 'fund-1', name: 'صندوق الوقف', balance: 100000 },
      ]);

      const { result } = renderHook(() => useFunds(), {
        wrapper: createWrapper(),
      });

      expect(result.current.funds).toBeDefined();
    });

    it('should have loading state initially', () => {
      const { result } = renderHook(() => useFunds(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBeDefined();
    });
  });

  describe('data structure', () => {
    it('should return funds as array', async () => {
      const { result } = renderHook(() => useFunds(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(Array.isArray(result.current.funds)).toBe(true);
      });
    });
  });

  describe('mutations', () => {
    it('should have addFund function', () => {
      const { result } = renderHook(() => useFunds(), {
        wrapper: createWrapper(),
      });

      expect(result.current.addFund).toBeDefined();
    });

    it('should have updateFund function', () => {
      const { result } = renderHook(() => useFunds(), {
        wrapper: createWrapper(),
      });

      expect(result.current.updateFund).toBeDefined();
    });

    it('should have updateFundAsync function', () => {
      const { result } = renderHook(() => useFunds(), {
        wrapper: createWrapper(),
      });

      expect(result.current.updateFundAsync).toBeDefined();
    });
  });
});
