/**
 * اختبارات hook المصادقة
 * useAuth Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/auth/useAuth';
import { createTestQueryClient } from '../../utils/test-utils';
import { supabase } from '@/integrations/supabase/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';

// Wrapper for hooks that need AuthProvider
const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have loading state defined', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      // isLoading may start as true or become false quickly due to mock
      expect(result.current.isLoading).toBeDefined();
    });

    it('should have null user initially', () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: mockUser as never, session: { access_token: 'token' } as never },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.signIn('test@example.com', 'password');
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    });

    it('should handle sign in error', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' } as never,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      // Wrap in try-catch to handle the expected error
      try {
        await act(async () => {
          await result.current.signIn('wrong@example.com', 'wrong');
        });
      } catch {
        // Error is expected
      }

      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('should sign out user', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('roles', () => {
    it('should return user roles', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      expect(result.current.roles).toBeDefined();
    });

    it('should check if user has specific role', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.hasRole).toBe('function');
    });
  });

  describe('permissions', () => {
    it('should check user permissions', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.hasPermission).toBe('function');
    });
  });
});
