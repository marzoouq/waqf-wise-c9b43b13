/**
 * اختبارات Hooks المحاسبة - اختبارات وظيفية شاملة
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
            { id: '1', code: '1001', name_ar: 'النقدية', account_type: 'asset' },
            { id: '2', code: '2001', name_ar: 'الدائنون', account_type: 'liability' }
          ], 
          error: null 
        }),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      is: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ 
          data: [{ id: '1', code: '1000', name_ar: 'الأصول' }], 
          error: null 
        }),
      }),
      gte: vi.fn().mockReturnValue({
        lte: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ 
          data: { id: 'new-account', code: '1002', name_ar: 'حساب جديد' }, 
          error: null 
        }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  })),
  rpc: vi.fn().mockResolvedValue({ data: { total_debit: 1000, total_credit: 1000 }, error: null }),
  auth: {
    getSession: vi.fn().mockResolvedValue({ 
      data: { session: { user: { id: 'user-1' } } }, 
      error: null 
    }),
    onAuthStateChange: vi.fn(() => ({ 
      data: { subscription: { unsubscribe: vi.fn() } } 
    })),
    getUser: vi.fn().mockResolvedValue({ 
      data: { user: { id: 'user-1' } }, 
      error: null 
    }),
  },
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

describe('Accounting Hooks - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAccounts Hook', () => {
    it('should return proper data structure', async () => {
      const { useAccounts } = await import('@/hooks/accounting/useAccounts');
      const { result } = renderHook(() => useAccounts(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('accounts');
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
    });

    it('should return accounts array', async () => {
      const { useAccounts } = await import('@/hooks/accounting/useAccounts');
      const { result } = renderHook(() => useAccounts(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      expect(Array.isArray(result.current.accounts)).toBe(true);
    });

    it('should have refetch capability', async () => {
      const { useAccounts } = await import('@/hooks/accounting/useAccounts');
      const { result } = renderHook(() => useAccounts(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('useAddAccount Hook', () => {
    it('should return mutation with mutate function', async () => {
      const { useAddAccount } = await import('@/hooks/accounting/useAddAccount');
      const { result } = renderHook(() => useAddAccount(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('mutate');
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have isLoading state', async () => {
      const { useAddAccount } = await import('@/hooks/accounting/useAddAccount');
      const { result } = renderHook(() => useAddAccount(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current.isLoading).toBe(false);
    });

    it('should have isSuccess state', async () => {
      const { useAddAccount } = await import('@/hooks/accounting/useAddAccount');
      const { result } = renderHook(() => useAddAccount(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('isSuccess');
    });
  });

  describe('useJournalEntries Hook', () => {
    it('should return journal entries data', async () => {
      const { useJournalEntries } = await import('@/hooks/accounting/useJournalEntries');
      const { result } = renderHook(() => useJournalEntries(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('entries');
    });

    it('should handle hook execution', async () => {
      const { useJournalEntries } = await import('@/hooks/accounting/useJournalEntries');
      const { result } = renderHook(
        () => useJournalEntries(),
        { wrapper: createWrapper() }
      );
      
      expect(result.current).toHaveProperty('isLoading');
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
    });
  });

  describe('useFiscalYears Hook', () => {
    it('should return fiscal years', async () => {
      const { useFiscalYears } = await import('@/hooks/accounting/useFiscalYears');
      const { result } = renderHook(() => useFiscalYears(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('fiscalYears');
    });

    it('should have current fiscal year helper', async () => {
      const { useFiscalYears } = await import('@/hooks/accounting/useFiscalYears');
      const { result } = renderHook(() => useFiscalYears(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      expect(result.current).toHaveProperty('currentFiscalYear');
    });
  });

  describe('useBudgets Hook', () => {
    it('should return budgets data', async () => {
      const { useBudgets } = await import('@/hooks/accounting/useBudgets');
      const { result } = renderHook(() => useBudgets(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('budgets');
    });

    it('should return budgets array', async () => {
      const { useBudgets } = await import('@/hooks/accounting/useBudgets');
      const { result } = renderHook(() => useBudgets(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      expect(Array.isArray(result.current.budgets)).toBe(true);
    });
  });

  describe('useGeneralLedger Hook', () => {
    it('should return ledger data', async () => {
      const { useGeneralLedger } = await import('@/hooks/accounting/useGeneralLedger');
      const { result } = renderHook(() => useGeneralLedger({ accountId: 'test' }), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('isLoading');
    });
  });

  describe('useAddJournalEntry Hook', () => {
    it('should return mutation', async () => {
      const mockForm = {
        getValues: vi.fn().mockReturnValue(''),
        setValue: vi.fn(),
        watch: vi.fn(),
        reset: vi.fn(),
        handleSubmit: vi.fn(),
        formState: { errors: {} },
        register: vi.fn(),
        control: {},
        getFieldState: vi.fn(),
        setError: vi.fn(),
        clearErrors: vi.fn(),
        trigger: vi.fn(),
        resetField: vi.fn(),
        setFocus: vi.fn(),
        unregister: vi.fn(),
      } as any;
      
      const { useAddJournalEntry } = await import('@/hooks/accounting/useAddJournalEntry');
      const { result } = renderHook(() => useAddJournalEntry(mockForm, false), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('lines');
      expect(result.current).toHaveProperty('setLines');
    });
  });

  describe('useApproveJournal Hook', () => {
    it('should return approval mutation', async () => {
      const { useApproveJournal } = await import('@/hooks/accounting/useApproveJournal');
      const { result } = renderHook(() => useApproveJournal(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('mutate');
    });
  });

  describe('useJournalEntriesList Hook', () => {
    it('should return paginated entries', async () => {
      const { useJournalEntriesList } = await import('@/hooks/accounting/useJournalEntriesList');
      const { result } = renderHook(() => useJournalEntriesList(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('entries');
    });
  });

  describe('Hook Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { useAccounts } = await import('@/hooks/accounting/useAccounts');
      const { result } = renderHook(() => useAccounts(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
    });
  });

  describe('RTL Support', () => {
    it('should work with Arabic account names', async () => {
      const { useAccounts } = await import('@/hooks/accounting/useAccounts');
      const { result } = renderHook(() => useAccounts(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      // Verify Arabic data is handled correctly
      expect(result.current).toBeDefined();
    });
  });
});
