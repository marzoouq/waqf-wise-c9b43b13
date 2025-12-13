/**
 * اختبارات خدمة المستخدمين
 * UserService Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '@/services/user.service';
import { supabase } from '@/integrations/supabase/client';
import { setMockTableData, clearMockTableData } from '../../utils/supabase.mock';

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('getUserStats', () => {
    it('should return correct user statistics', async () => {
      setMockTableData('user_roles', [
        { user_id: 'user-1', role: 'admin', created_at: '2024-01-01' },
        { user_id: 'user-2', role: 'nazer', created_at: '2024-01-02' },
        { user_id: 'user-3', role: 'accountant', created_at: '2024-01-03' },
      ]);
      
      setMockTableData('profiles', [
        { id: 'user-1', email: 'admin@test.com', created_at: '2024-01-01', last_login_at: '2024-12-01' },
        { id: 'user-2', email: 'nazer@test.com', created_at: '2024-01-02', last_login_at: null },
      ]);

      const stats = await UserService.getUserStats();

      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('activeUsers');
      expect(stats).toHaveProperty('adminCount');
      expect(stats).toHaveProperty('recentUsers');
    });
  });

  describe('getUserRoles', () => {
    it('should return user roles', async () => {
      setMockTableData('user_roles', [
        { user_id: 'user-1', role: 'admin' },
        { user_id: 'user-1', role: 'nazer' },
      ]);

      const roles = await UserService.getUserRoles('user-1');

      expect(Array.isArray(roles)).toBe(true);
    });
  });

  describe('addRole', () => {
    it('should add a role to user', async () => {
      await expect(
        UserService.addRole('user-1', 'accountant')
      ).resolves.not.toThrow();

      expect(supabase.from).toHaveBeenCalledWith('user_roles');
    });
  });

  describe('removeRole', () => {
    it('should remove a role from user', async () => {
      await expect(
        UserService.removeRole('user-1', 'accountant')
      ).resolves.not.toThrow();

      expect(supabase.from).toHaveBeenCalledWith('user_roles');
    });
  });

  describe('getUsersWithRoles', () => {
    it('should return users with their roles', async () => {
      setMockTableData('users_profiles_cache', [
        {
          user_id: 'user-1',
          email: 'admin@test.com',
          full_name: 'Admin User',
          roles: ['admin', 'nazer'],
          user_created_at: '2024-01-01',
        },
      ]);

      const users = await UserService.getUsersWithRoles();

      expect(Array.isArray(users)).toBe(true);
    });
  });

  describe('getActiveSessions', () => {
    it('should return active sessions for a user', async () => {
      setMockTableData('user_sessions', [
        {
          id: 'session-1',
          user_id: 'user-1',
          is_active: true,
          last_activity_at: '2024-12-01T10:00:00Z',
        },
      ]);

      const sessions = await UserService.getActiveSessions('user-1');

      expect(Array.isArray(sessions)).toBe(true);
    });
  });

  describe('getAvailableUsers', () => {
    it('should return available users for messaging', async () => {
      setMockTableData('user_roles', [
        { user_id: 'user-1', role: 'nazer' },
        { user_id: 'user-2', role: 'accountant' },
      ]);

      const users = await UserService.getAvailableUsers();

      expect(Array.isArray(users)).toBe(true);
    });
  });
});
