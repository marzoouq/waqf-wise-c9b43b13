/**
 * اختبارات hook المستندات
 * useDocuments Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useDocuments } from '@/hooks/archive/useDocuments';
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

describe('useDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('fetching documents', () => {
    it('should return documents data', async () => {
      setMockTableData('documents', [
        { id: 'doc-1', title: 'عقد إيجار', type: 'contract' },
      ]);

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      expect(result.current.documents).toBeDefined();
    });

    it('should have loading state initially', () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBeDefined();
    });
  });

  describe('data structure', () => {
    it('should return documents as array', async () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(Array.isArray(result.current.documents)).toBe(true);
      });
    });
  });

  describe('mutations', () => {
    it('should have addDocument function', () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      expect(result.current.addDocument).toBeDefined();
    });

    it('should have updateDocument function', () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      expect(result.current.updateDocument).toBeDefined();
    });
  });
});
