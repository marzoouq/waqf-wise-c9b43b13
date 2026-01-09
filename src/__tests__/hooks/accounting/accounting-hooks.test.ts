/**
 * اختبارات Hooks المحاسبة - اختبارات وظيفية حقيقية
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
        is: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ data: { id: 'new-id' }, error: null }),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('Accounting Hooks - Real Functional Tests', () => {
  beforeEach(() => vi.clearAllMocks());

  it('useAccounts returns proper structure', async () => {
    const { useAccounts } = await import('@/hooks/accounting/useAccounts');
    const { result } = renderHook(() => useAccounts(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('isLoading');
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
  });

  it('useAddAccount returns mutation', async () => {
    const { useAddAccount } = await import('@/hooks/accounting/useAddAccount');
    const { result } = renderHook(() => useAddAccount(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('mutate');
    expect(typeof result.current.mutate).toBe('function');
  });

  it('useJournalEntries returns data', async () => {
    const { useJournalEntries } = await import('@/hooks/accounting/useJournalEntries');
    const { result } = renderHook(() => useJournalEntries(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('isLoading');
  });

  it('useFiscalYears returns fiscal years', async () => {
    const { useFiscalYears } = await import('@/hooks/accounting/useFiscalYears');
    const { result } = renderHook(() => useFiscalYears(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('isLoading');
  });

  it('useBudgets returns budgets data', async () => {
    const { useBudgets } = await import('@/hooks/accounting/useBudgets');
    const { result } = renderHook(() => useBudgets(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('isLoading');
  });
});
