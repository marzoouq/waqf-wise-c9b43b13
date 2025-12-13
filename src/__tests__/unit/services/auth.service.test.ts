/**
 * اختبارات خدمة المصادقة
 * Auth Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/services/auth.service';
import { supabase } from '@/integrations/supabase/client';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return current authenticated user', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser as any },
        error: null,
      });

      const result = await AuthService.getCurrentUser();
      
      expect(result).toBeDefined();
    });
  });

  describe('getUserProfile', () => {
    it('should fetch user profile', async () => {
      const result = await AuthService.getUserProfile('user-1');
      
      expect(result).toBeDefined();
    });
  });

  describe('getUserRoles', () => {
    it('should fetch user roles', async () => {
      const result = await AuthService.getUserRoles('user-1');
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: { id: 'user-1' } as any, session: { access_token: 'token' } as any },
        error: null,
      });

      const result = await AuthService.login('test@example.com', 'password123');
      
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null });

      await AuthService.logout();
      
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});
