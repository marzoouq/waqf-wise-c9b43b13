/**
 * اختبارات hook الطلبات
 * useRequests Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { useRequests } from '@/hooks/requests/useRequests';
import { clearMockTableData, setMockTableData } from '../../utils/supabase.mock';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
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

describe('useRequests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('fetching requests', () => {
    it('should return requests data', async () => {
      setMockTableData('beneficiary_requests', [
        { id: 'req-1', description: 'طلب فزعة', status: 'pending' },
      ]);

      const { result } = renderHook(() => useRequests(), {
        wrapper: createWrapper(),
      });

      expect(result.current.requests).toBeDefined();
    });

    it('should have loading state initially', () => {
      const { result } = renderHook(() => useRequests(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBeDefined();
    });
  });

  describe('data structure', () => {
    it('should return requests as array', async () => {
      const { result } = renderHook(() => useRequests(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(Array.isArray(result.current.requests)).toBe(true);
      });
    });
  });

  describe('mutations', () => {
    it('should have createRequest function', () => {
      const { result } = renderHook(() => useRequests(), {
        wrapper: createWrapper(),
      });

      expect(result.current.createRequest).toBeDefined();
    });

    it('should have reviewRequest function', () => {
      const { result } = renderHook(() => useRequests(), {
        wrapper: createWrapper(),
      });

      expect(result.current.reviewRequest).toBeDefined();
    });

    it('should have getRequest function', () => {
      const { result } = renderHook(() => useRequests(), {
        wrapper: createWrapper(),
      });

      expect(result.current.getRequest).toBeDefined();
    });
  });
});
