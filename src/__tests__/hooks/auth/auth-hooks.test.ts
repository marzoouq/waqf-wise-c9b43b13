/**
 * اختبارات Hooks المصادقة - مبسطة
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }), onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })) },
    from: vi.fn(() => ({ select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }) })),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, isLoading: false, roles: [] }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: qc }, React.createElement(BrowserRouter, null, children));
};

describe('Auth Hooks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('useAuth returns auth state', async () => {
    const { useAuth } = await import('@/hooks/auth/useAuth');
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('isLoading');
  });

  it('usePermissions returns permissions', async () => {
    const { usePermissions } = await import('@/hooks/auth/usePermissions');
    const { result } = renderHook(() => usePermissions(), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });

  it('useUserRole returns role info', async () => {
    const { useUserRole } = await import('@/hooks/auth/useUserRole');
    const { result } = renderHook(() => useUserRole(), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });
});
