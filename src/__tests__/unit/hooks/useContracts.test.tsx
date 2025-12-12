/**
 * اختبارات hook العقود
 * Contracts Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useContracts } from '@/hooks/property/useContracts';
import { clearMockTableData, setMockTableData } from '../../utils/supabase.mock';
import { mockContracts } from '../../utils/data.fixtures';

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

describe('useContracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('fetching contracts', () => {
    it('should return contracts array', () => {
      setMockTableData('contracts', mockContracts);

      const { result } = renderHook(() => useContracts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.contracts).toBeDefined();
      expect(Array.isArray(result.current.contracts)).toBe(true);
    });

    it('should have loading state initially', () => {
      const { result } = renderHook(() => useContracts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBeDefined();
    });
  });

  describe('mutations', () => {
    it('should have addContract function', () => {
      const { result } = renderHook(() => useContracts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.addContract).toBeDefined();
      expect(typeof result.current.addContract).toBe('object');
    });

    it('should have updateContract function', () => {
      const { result } = renderHook(() => useContracts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.updateContract).toBeDefined();
      expect(typeof result.current.updateContract).toBe('object');
    });

    it('should have deleteContract function', () => {
      const { result } = renderHook(() => useContracts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.deleteContract).toBeDefined();
      expect(typeof result.current.deleteContract).toBe('object');
    });
  });

  describe('data structure', () => {
    it('should return contracts as array', () => {
      setMockTableData('contracts', mockContracts);

      const { result } = renderHook(() => useContracts(), {
        wrapper: createWrapper(),
      });

      expect(Array.isArray(result.current.contracts)).toBe(true);
    });
  });
});
