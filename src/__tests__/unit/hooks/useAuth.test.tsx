/**
 * اختبارات hook المصادقة
 * useAuth Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/auth/useAuth';
import { createTestQueryClient } from '../../utils/test-utils';
import { mockSupabaseAuth } from '../../utils/supabase.mock';
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
    it('should start with loading state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should have null user initially', () => {
      mockSupabaseAuth.getUser.mockResolvedValueOnce({
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
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.signIn('test@example.com', 'password');
      });

      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalled();
    });

    it('should handle sign in error', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.signIn('wrong@example.com', 'wrong');
      });

      // Error should be handled internally
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('should sign out user', async () => {
      mockSupabaseAuth.signOut.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSupabaseAuth.signOut).toHaveBeenCalled();
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
