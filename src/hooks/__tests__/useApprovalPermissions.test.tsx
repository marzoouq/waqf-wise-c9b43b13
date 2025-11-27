import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  }
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id' }
  }))
}));

import { useApprovalPermissions } from '../useApprovalPermissions';
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

describe('useApprovalPermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('يجب أن يُرجع null للدور عندما لا يوجد مستخدم', () => {
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

    const { result } = renderHook(() => useApprovalPermissions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.userRole).toBeNull();
  });

  it('يجب أن يُرجع false لـ canApproveLevel عندما لا يوجد دور', () => {
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

    const { result } = renderHook(() => useApprovalPermissions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.canApproveLevel(1)).toBe(false);
    expect(result.current.canApproveLevel(2)).toBe(false);
    expect(result.current.canApproveLevel(3)).toBe(false);
  });

  it('يجب أن يكون لديه الخصائص المطلوبة', () => {
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

    const { result } = renderHook(() => useApprovalPermissions(), {
      wrapper: createWrapper(),
    });

    expect('canApproveLevel' in result.current).toBe(true);
    expect('userRole' in result.current).toBe(true);
    expect('isLoading' in result.current).toBe(true);
    expect(typeof result.current.canApproveLevel).toBe('function');
  });

  describe('canApproveLevel function', () => {
    it('يجب أن تكون دالة', () => {
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

      const { result } = renderHook(() => useApprovalPermissions(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.canApproveLevel).toBe('function');
    });

    it('يجب أن تقبل مستوى الموافقة كمعامل', () => {
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

      const { result } = renderHook(() => useApprovalPermissions(), {
        wrapper: createWrapper(),
      });

      // يجب ألا تُلقي خطأ عند استدعائها بقيم صحيحة
      expect(() => result.current.canApproveLevel(1)).not.toThrow();
      expect(() => result.current.canApproveLevel(2)).not.toThrow();
      expect(() => result.current.canApproveLevel(3)).not.toThrow();
    });
  });
});
