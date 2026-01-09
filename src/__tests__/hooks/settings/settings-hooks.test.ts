/**
 * اختبارات Hooks الإعدادات - مبسطة
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({ select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) })),
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }), onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })), mfa: { listFactors: vi.fn().mockResolvedValue({ data: { totp: [] }, error: null }) } },
  },
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: qc }, children);
};

describe('Settings Hooks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('useTwoFactorAuth returns 2FA state', async () => {
    const { useTwoFactorAuth } = await import('@/hooks/settings');
    const { result } = renderHook(() => useTwoFactorAuth('user-1'), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });

  it('useSettingsCategories returns categories', async () => {
    const { useSettingsCategories } = await import('@/hooks/settings');
    const { result } = renderHook(() => useSettingsCategories(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('isLoading');
  });
});
