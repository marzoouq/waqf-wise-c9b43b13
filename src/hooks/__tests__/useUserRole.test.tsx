import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({ subscribe: vi.fn() }))
    })),
    removeChannel: vi.fn()
  }
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id' }
  }))
}));

import { useUserRole } from '../useUserRole';
import { useAuth } from '@/hooks/useAuth';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useUserRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجب أن يُرجع roles فارغة عندما لا يوجد مستخدم', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      profile: null,
      isLoading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      hasPermission: vi.fn(),
      isRole: vi.fn(),
      checkPermissionSync: vi.fn(),
      loading: false,
    } as any);

    const { result } = renderHook(() => useUserRole(), {
      wrapper: createWrapper(),
    });

    expect(result.current.roles).toEqual([]);
  });

  it('يجب أن يُرجع الخصائص المطلوبة', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'test-user-id' } as any,
      profile: null,
      isLoading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      hasPermission: vi.fn(),
      isRole: vi.fn(),
      checkPermissionSync: vi.fn(),
      loading: false,
    } as any);

    const { result } = renderHook(() => useUserRole(), {
      wrapper: createWrapper(),
    });

    expect('roles' in result.current).toBe(true);
    expect('primaryRole' in result.current).toBe(true);
    expect('isLoading' in result.current).toBe(true);
    expect('hasRole' in result.current).toBe(true);
    expect('isNazer' in result.current).toBe(true);
    expect('isAdmin' in result.current).toBe(true);
    expect('isAccountant' in result.current).toBe(true);
  });

  it('يجب أن تكون hasRole دالة', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      profile: null,
      isLoading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      hasPermission: vi.fn(),
      isRole: vi.fn(),
      checkPermissionSync: vi.fn(),
      loading: false,
    } as any);

    const { result } = renderHook(() => useUserRole(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.hasRole).toBe('function');
  });

  it('يجب أن تُرجع hasRole false عندما لا توجد أدوار', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      profile: null,
      isLoading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      hasPermission: vi.fn(),
      isRole: vi.fn(),
      checkPermissionSync: vi.fn(),
      loading: false,
    } as any);

    const { result } = renderHook(() => useUserRole(), {
      wrapper: createWrapper(),
    });

    expect(result.current.hasRole('admin')).toBe(false);
    expect(result.current.hasRole('nazer')).toBe(false);
  });
});
