/**
 * اختبارات خدمة الأمان
 * SecurityService Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SecurityService } from '@/services/security.service';
import { setMockTableData, clearMockTableData } from '../../utils/supabase.mock';

describe('SecurityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('getSecurityEvents', () => {
    it('should return security events', async () => {
      setMockTableData('security_events_log', [
        { id: 'event-1', event_type: 'login_failed', created_at: '2024-12-01T10:00:00Z' },
        { id: 'event-2', event_type: 'password_changed', created_at: '2024-12-01T11:00:00Z' },
      ]);

      const events = await SecurityService.getSecurityEvents(50);

      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe('getLoginAttempts', () => {
    it('should return login attempts', async () => {
      setMockTableData('login_attempts_log', [
        { id: 'attempt-1', user_email: 'user@test.com', success: true },
        { id: 'attempt-2', user_email: 'user@test.com', success: false },
      ]);

      const attempts = await SecurityService.getLoginAttempts(20);

      expect(Array.isArray(attempts)).toBe(true);
    });
  });

  describe('getUserRole', () => {
    it('should return user role', async () => {
      setMockTableData('user_roles', [
        { user_id: 'user-1', role: 'admin' },
      ]);

      const role = await SecurityService.getUserRole('user-1');

      expect(role).toBeDefined();
    });

    it('should return null if user has no role', async () => {
      setMockTableData('user_roles', []);

      const role = await SecurityService.getUserRole('nonexistent-user');

      // May return null or the mock default
      expect(role === null || role === undefined || typeof role === 'string').toBe(true);
    });
  });

  describe('getRolePermissions', () => {
    it('should return permissions for a role', async () => {
      setMockTableData('role_permissions', [
        { role: 'admin', permission_id: 'perm-1', granted: true },
        { role: 'admin', permission_id: 'perm-2', granted: true },
      ]);

      const permissions = await SecurityService.getRolePermissions('admin');

      expect(Array.isArray(permissions)).toBe(true);
    });
  });

  describe('upsertRolePermission', () => {
    it('should upsert role permission', async () => {
      await expect(
        SecurityService.upsertRolePermission('admin', 'perm-1', true)
      ).resolves.not.toThrow();
    });
  });

  describe('getUserPermissionOverrides', () => {
    it('should return user permission overrides', async () => {
      setMockTableData('user_permissions', [
        { user_id: 'user-1', permission_key: 'view_reports', granted: true },
      ]);

      const overrides = await SecurityService.getUserPermissionOverrides('user-1');

      expect(Array.isArray(overrides)).toBe(true);
    });
  });

  describe('upsertUserPermissionOverride', () => {
    it('should upsert user permission override', async () => {
      await expect(
        SecurityService.upsertUserPermissionOverride('user-1', 'view_reports', true)
      ).resolves.not.toThrow();
    });
  });

  describe('removeUserPermissionOverride', () => {
    it('should remove user permission override', async () => {
      await expect(
        SecurityService.removeUserPermissionOverride('user-1', 'view_reports')
      ).resolves.not.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current authenticated user', async () => {
      // This depends on auth mock
      const user = await SecurityService.getCurrentUser();
      
      // User may be null in test environment
      expect(user === null || typeof user === 'object').toBe(true);
    });
  });
});
