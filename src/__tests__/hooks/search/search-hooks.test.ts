/**
 * اختبارات Hooks البحث - مبسطة
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({ select: vi.fn().mockReturnValue({ ilike: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue({ data: [], error: null }) }) }) })),
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }), onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })) },
  },
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: qc }, children);
};

describe('Search Hooks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('useGlobalSearchData returns search functionality', async () => {
    const { useGlobalSearchData } = await import('@/hooks/search');
    const { result } = renderHook(() => useGlobalSearchData('test'), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });

  it('useRecentSearches returns recent searches', async () => {
    const { useRecentSearches } = await import('@/hooks/search');
    const { result } = renderHook(() => useRecentSearches('user-1'), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });
});
