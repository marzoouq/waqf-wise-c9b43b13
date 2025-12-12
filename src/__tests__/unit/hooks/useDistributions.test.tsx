/**
 * اختبارات hook التوزيعات
 * useDistributions Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDistributions } from '@/hooks/distributions/useDistributions';
import { createTestQueryClient } from '../../utils/test-utils';
import { setMockTableData, clearMockTableData } from '../../utils/supabase.mock';
import { mockDistributions } from '../../utils/data.fixtures';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('useDistributions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('fetching distributions', () => {
    it('should fetch distributions list', () => {
      setMockTableData('distributions', mockDistributions);

      const { result } = renderHook(() => useDistributions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.distributions).toBeDefined();
    });

    it('should return loading state', () => {
      setMockTableData('distributions', []);

      const { result } = renderHook(() => useDistributions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBeDefined();
    });
  });

  describe('data structure', () => {
    it('should return distributions array', () => {
      setMockTableData('distributions', mockDistributions);

      const { result } = renderHook(() => useDistributions(), {
        wrapper: createWrapper(),
      });

      expect(Array.isArray(result.current.distributions)).toBe(true);
    });
  });

  describe('mutations', () => {
    it('should have addDistribution mutation', () => {
      const { result } = renderHook(() => useDistributions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.addDistribution).toBeDefined();
    });

    it('should have updateDistribution mutation', () => {
      const { result } = renderHook(() => useDistributions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.updateDistribution).toBeDefined();
    });

    it('should have deleteDistribution mutation', () => {
      const { result } = renderHook(() => useDistributions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.deleteDistribution).toBeDefined();
    });

    it('should have generateDistribution function', () => {
      const { result } = renderHook(() => useDistributions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.generateDistribution).toBeDefined();
    });
  });
});
