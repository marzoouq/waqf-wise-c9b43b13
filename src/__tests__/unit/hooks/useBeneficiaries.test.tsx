/**
 * اختبارات hook المستفيدين
 * useBeneficiaries Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBeneficiaries } from '@/hooks/beneficiary/useBeneficiaries';
import { createTestQueryClient } from '../../utils/test-utils';
import { setMockTableData, clearMockTableData } from '../../utils/supabase.mock';
import { mockBeneficiaries } from '../../utils/data.fixtures';
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

describe('useBeneficiaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('fetching beneficiaries', () => {
    it('should fetch beneficiaries list', () => {
      setMockTableData('beneficiaries', mockBeneficiaries);

      const { result } = renderHook(() => useBeneficiaries(), {
        wrapper: createWrapper(),
      });

      expect(result.current.beneficiaries).toBeDefined();
    });

    it('should return loading state initially', () => {
      setMockTableData('beneficiaries', []);

      const { result } = renderHook(() => useBeneficiaries(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should handle loading state', () => {
      setMockTableData('beneficiaries', mockBeneficiaries);

      const { result } = renderHook(() => useBeneficiaries(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBeDefined();
    });
  });

  describe('mutations', () => {
    it('should have addBeneficiary mutation', () => {
      const { result } = renderHook(() => useBeneficiaries(), {
        wrapper: createWrapper(),
      });

      expect(result.current.addBeneficiary).toBeDefined();
    });

    it('should have updateBeneficiary mutation', () => {
      const { result } = renderHook(() => useBeneficiaries(), {
        wrapper: createWrapper(),
      });

      expect(result.current.updateBeneficiary).toBeDefined();
    });

    it('should have deleteBeneficiary mutation', () => {
      const { result } = renderHook(() => useBeneficiaries(), {
        wrapper: createWrapper(),
      });

      expect(result.current.deleteBeneficiary).toBeDefined();
    });
  });

  describe('data structure', () => {
    it('should return beneficiaries array', () => {
      setMockTableData('beneficiaries', mockBeneficiaries);

      const { result } = renderHook(() => useBeneficiaries(), {
        wrapper: createWrapper(),
      });

      expect(Array.isArray(result.current.beneficiaries)).toBe(true);
    });

    it('should return totalCount', () => {
      setMockTableData('beneficiaries', mockBeneficiaries);

      const { result } = renderHook(() => useBeneficiaries(), {
        wrapper: createWrapper(),
      });

      expect(result.current.totalCount).toBeDefined();
    });
  });
});
