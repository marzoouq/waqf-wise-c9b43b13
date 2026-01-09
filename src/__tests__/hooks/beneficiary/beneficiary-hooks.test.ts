/**
 * اختبارات Hooks المستفيدين - مبسطة
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({ select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }), eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }) })),
    storage: { from: vi.fn(() => ({ upload: vi.fn().mockResolvedValue({ data: {}, error: null }) })) },
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }), onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })) },
  },
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: qc }, children);
};

describe('Beneficiary Hooks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('useBeneficiaries returns data structure', async () => {
    const { useBeneficiaries } = await import('@/hooks/beneficiary/useBeneficiaries');
    const { result } = renderHook(() => useBeneficiaries(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('isLoading');
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
  });

  it('useFamilies returns families', async () => {
    const { useFamilies } = await import('@/hooks/beneficiary/useFamilies');
    const { result } = renderHook(() => useFamilies(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('isLoading');
  });

  it('useTribes returns tribes', async () => {
    const { useTribes } = await import('@/hooks/beneficiary/useTribes');
    const { result } = renderHook(() => useTribes(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('isLoading');
  });
});
