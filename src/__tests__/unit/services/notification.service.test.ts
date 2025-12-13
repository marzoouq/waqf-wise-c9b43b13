/**
 * اختبارات خدمة الإشعارات
 * Notification Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from '@/services/notification.service';
import { supabase } from '@/integrations/supabase/client';
import { setMockTableData, clearMockTableData } from '../../utils/supabase.mock';

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('send', () => {
    it('should send a notification', async () => {
      const notification = {
        user_id: 'user-1',
        title: 'إشعار جديد',
        message: 'محتوى الإشعار',
        type: 'info' as const,
      };

      setMockTableData('notifications', [{ id: 'new-id', ...notification }]);

      const result = await NotificationService.send(notification);
      
      expect(supabase.from).toHaveBeenCalledWith('notifications');
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('sendBulk', () => {
    it('should send bulk notifications', async () => {
      const notifications = [
        { user_id: 'user-1', title: 'إشعار 1', message: 'محتوى 1' },
        { user_id: 'user-2', title: 'إشعار 2', message: 'محتوى 2' },
      ];

      setMockTableData('notifications', notifications.map((n, i) => ({ id: `n-${i}`, ...n })));

      const result = await NotificationService.sendBulk(notifications);
      
      expect(result.success).toBe(true);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      setMockTableData('notifications', [{ id: 'n-1', is_read: false }]);

      await NotificationService.markAsRead('n-1');
      
      expect(supabase.from).toHaveBeenCalledWith('notifications');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      setMockTableData('notifications', [
        { id: 'n-1', is_read: false },
        { id: 'n-2', is_read: false },
      ]);

      await NotificationService.markAllAsRead('user-1');
      
      expect(supabase.from).toHaveBeenCalledWith('notifications');
    });
  });

  describe('getUserNotifications', () => {
    it('should fetch user notifications', async () => {
      setMockTableData('notifications', [
        { id: 'n-1', user_id: 'user-1', title: 'Test' },
      ]);

      const result = await NotificationService.getUserNotifications('user-1');
      
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
