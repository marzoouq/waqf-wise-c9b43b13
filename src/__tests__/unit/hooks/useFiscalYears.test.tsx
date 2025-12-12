/**
 * اختبارات hook السنوات المالية
 * Fiscal Years Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useFiscalYears } from '@/hooks/accounting/useFiscalYears';
import { clearMockTableData, setMockTableData } from '../../utils/supabase.mock';
import { mockFiscalYears } from '../../utils/data.fixtures';

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

describe('useFiscalYears', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('fetching fiscal years', () => {
    it('should return fiscal years array', () => {
      setMockTableData('fiscal_years', mockFiscalYears);

      const { result } = renderHook(() => useFiscalYears(), {
        wrapper: createWrapper(),
      });

      expect(result.current.fiscalYears).toBeDefined();
      expect(Array.isArray(result.current.fiscalYears)).toBe(true);
    });

    it('should have loading state initially', () => {
      const { result } = renderHook(() => useFiscalYears(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBeDefined();
    });
  });

  describe('data structure', () => {
    it('should return fiscalYears as array', () => {
      setMockTableData('fiscal_years', mockFiscalYears);

      const { result } = renderHook(() => useFiscalYears(), {
        wrapper: createWrapper(),
      });

      expect(Array.isArray(result.current.fiscalYears)).toBe(true);
    });
  });
});
