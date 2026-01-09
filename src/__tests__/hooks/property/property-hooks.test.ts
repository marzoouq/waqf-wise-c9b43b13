/**
 * اختبارات Hooks العقارات - مبسطة
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({ select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }), eq: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) }) })),
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }), onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })) },
  },
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: qc }, children);
};

describe('Property Hooks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('useProperties returns properties', async () => {
    const { useProperties } = await import('@/hooks/property/useProperties');
    const { result } = renderHook(() => useProperties(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('isLoading');
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
  });

  it('useTenants returns tenants', async () => {
    const { useTenants } = await import('@/hooks/property/useTenants');
    const { result } = renderHook(() => useTenants(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('isLoading');
  });

  it('useContracts returns contracts', async () => {
    const { useContracts } = await import('@/hooks/property/useContracts');
    const { result } = renderHook(() => useContracts(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('isLoading');
  });
});
