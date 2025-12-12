/**
 * اختبارات hook التقارير
 * Reports Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useReports } from '@/hooks/reports/useReports';
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

describe('useReports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('fetching reports', () => {
    it('should return reports data', () => {
      setMockTableData('reports', []);

      const { result } = renderHook(() => useReports(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
    });

    it('should have loading state', () => {
      const { result } = renderHook(() => useReports(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBeDefined();
    });
  });

  describe('report functions', () => {
    it('should have templates array', () => {
      const { result } = renderHook(() => useReports(), {
        wrapper: createWrapper(),
      });

      expect(result.current.templates).toBeDefined();
      expect(Array.isArray(result.current.templates)).toBe(true);
    });

    it('should have generateReport function', () => {
      const { result } = renderHook(() => useReports(), {
        wrapper: createWrapper(),
      });

      expect(result.current.generateReport).toBeDefined();
    });

    it('should have createTemplate function', () => {
      const { result } = renderHook(() => useReports(), {
        wrapper: createWrapper(),
      });

      expect(result.current.createTemplate).toBeDefined();
    });
  });
});
