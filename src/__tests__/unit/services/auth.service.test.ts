/**
 * اختبارات خدمة المصادقة
 * Auth Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/services/auth.service';
import { mockSupabaseAuth } from '../../utils/supabase.mock';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return current authenticated user', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      
      mockSupabaseAuth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
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

  describe('loginWithPassword', () => {
    it('should login with valid credentials', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({
        data: { user: { id: 'user-1' }, session: { access_token: 'token' } },
        error: null,
      });

      const result = await AuthService.loginWithPassword('test@example.com', 'password123');
      
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      mockSupabaseAuth.signOut.mockResolvedValueOnce({ error: null });

      await AuthService.logout();
      
      expect(mockSupabaseAuth.signOut).toHaveBeenCalled();
    });
  });
});
