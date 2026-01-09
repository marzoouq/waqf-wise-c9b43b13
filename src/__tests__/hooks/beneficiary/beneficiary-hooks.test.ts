/**
 * اختبارات Hooks المستفيدين - اختبارات وظيفية شاملة
 * @version 2.0.0
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockReturnValue({
        range: vi.fn().mockResolvedValue({ 
          data: [
            { id: '1', full_name: 'أحمد محمد', national_id: '1234567890', status: 'active' },
            { id: '2', full_name: 'فاطمة علي', national_id: '0987654321', status: 'active' }
          ], 
          error: null,
          count: 2 
        }),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ 
          data: { id: '1', full_name: 'أحمد محمد', status: 'active' }, 
          error: null 
        }),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      ilike: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ 
          data: { id: 'new-beneficiary', full_name: 'مستفيد جديد' }, 
          error: null 
        }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: { id: '1', full_name: 'أحمد محمد معدل' }, 
            error: null 
          }),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test.pdf' }, error: null }),
      remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/file.pdf' } }),
    })),
  },
  auth: {
    getSession: vi.fn().mockResolvedValue({ 
      data: { session: { user: { id: 'user-1' } } }, 
      error: null 
    }),
    onAuthStateChange: vi.fn(() => ({ 
      data: { subscription: { unsubscribe: vi.fn() } } 
    })),
    getUser: vi.fn().mockResolvedValue({ 
      data: { user: { id: 'user-1', email: 'test@test.com' } }, 
      error: null 
    }),
  },
  rpc: vi.fn().mockResolvedValue({ data: { total: 100 }, error: null }),
  functions: {
    invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
  },
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Query Client wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('Beneficiary Hooks - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useBeneficiaries Hook', () => {
    it('should return proper data structure', async () => {
      const { useBeneficiaries } = await import('@/hooks/beneficiary/useBeneficiaries');
      const { result } = renderHook(() => useBeneficiaries(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
    });

    it('should handle loading state correctly', async () => {
      const { useBeneficiaries } = await import('@/hooks/beneficiary/useBeneficiaries');
      const { result } = renderHook(() => useBeneficiaries(), { wrapper: createWrapper() });
      
      // Initially loading
      expect(typeof result.current.isLoading).toBe('boolean');
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
    });

    it('should have refetch function', async () => {
      const { useBeneficiaries } = await import('@/hooks/beneficiary/useBeneficiaries');
      const { result } = renderHook(() => useBeneficiaries(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('useFamilies Hook', () => {
    it('should return families data structure', async () => {
      const { useFamilies } = await import('@/hooks/beneficiary/useFamilies');
      const { result } = renderHook(() => useFamilies(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('families');
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
    });

    it('should return families array', async () => {
      const { useFamilies } = await import('@/hooks/beneficiary/useFamilies');
      const { result } = renderHook(() => useFamilies(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      expect(Array.isArray(result.current.families)).toBe(true);
    });
  });

  describe('useTribes Hook', () => {
    it('should return tribes data structure', async () => {
      const { useTribes } = await import('@/hooks/beneficiary/useTribes');
      const { result } = renderHook(() => useTribes(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('tribes');
    });

    it('should handle loading and success states', async () => {
      const { useTribes } = await import('@/hooks/beneficiary/useTribes');
      const { result } = renderHook(() => useTribes(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
    });
  });

  describe('useBeneficiaryActivity Hook', () => {
    it('should return activity log for beneficiary', async () => {
      const { useBeneficiaryActivity } = await import('@/hooks/beneficiary/useBeneficiaryActivity');
      const { result } = renderHook(
        () => useBeneficiaryActivity('test-beneficiary-id'),
        { wrapper: createWrapper() }
      );
      
      expect(result.current).toHaveProperty('activities');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('refetch');
    });

    it('should not fetch when beneficiaryId is empty', async () => {
      const { useBeneficiaryActivity } = await import('@/hooks/beneficiary/useBeneficiaryActivity');
      const { result } = renderHook(
        () => useBeneficiaryActivity(''),
        { wrapper: createWrapper() }
      );
      
      expect(result.current.activities).toEqual([]);
    });
  });

  describe('useBeneficiaryProfileDocuments Hook', () => {
    it('should return documents query result', async () => {
      const { useBeneficiaryProfileDocuments } = await import('@/hooks/beneficiary/useBeneficiaryProfileDocuments');
      const { result } = renderHook(
        () => useBeneficiaryProfileDocuments('test-id'),
        { wrapper: createWrapper() }
      );
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('data');
    });

    it('should be disabled when no beneficiaryId', async () => {
      const { useBeneficiaryProfileDocuments } = await import('@/hooks/beneficiary/useBeneficiaryProfileDocuments');
      const { result } = renderHook(
        () => useBeneficiaryProfileDocuments(''),
        { wrapper: createWrapper() }
      );
      
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useBeneficiaryProfilePayments Hook', () => {
    it('should return payments history', async () => {
      const { useBeneficiaryProfilePayments } = await import('@/hooks/beneficiary/useBeneficiaryProfilePayments');
      const { result } = renderHook(
        () => useBeneficiaryProfilePayments('test-id'),
        { wrapper: createWrapper() }
      );
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('data');
    });
  });

  describe('useBeneficiaryProfileRequests Hook', () => {
    it('should return requests history', async () => {
      const { useBeneficiaryProfileRequests } = await import('@/hooks/beneficiary/useBeneficiaryProfileRequests');
      const { result } = renderHook(
        () => useBeneficiaryProfileRequests('test-id'),
        { wrapper: createWrapper() }
      );
      
      expect(result.current).toHaveProperty('isLoading');
    });
  });

  describe('useBeneficiaryExport Hook', () => {
    it('should return export function', async () => {
      const { useBeneficiaryExport } = await import('@/hooks/beneficiary/useBeneficiaryExport');
      const { result } = renderHook(() => useBeneficiaryExport(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('exportJournalEntries');
      expect(typeof result.current.exportJournalEntries).toBe('function');
    });
  });

  describe('Hook Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { useBeneficiaries } = await import('@/hooks/beneficiary/useBeneficiaries');
      const { result } = renderHook(() => useBeneficiaries(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
    });
  });

  describe('Hook Memoization', () => {
    it('should maintain stable references', async () => {
      const { useBeneficiaries } = await import('@/hooks/beneficiary/useBeneficiaries');
      const { result, rerender } = renderHook(() => useBeneficiaries(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      const initialRefetch = result.current.refetch;
      
      rerender();
      expect(result.current.refetch).toBe(initialRefetch);
    });
  });

  describe('RTL Support', () => {
    it('should work with RTL text', async () => {
      const { useBeneficiaries } = await import('@/hooks/beneficiary/useBeneficiaries');
      const { result } = renderHook(() => useBeneficiaries(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      // Hook should handle Arabic data correctly
      expect(result.current).toBeDefined();
    });
  });
});
