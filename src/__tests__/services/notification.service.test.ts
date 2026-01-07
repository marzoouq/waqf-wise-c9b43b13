/**
 * اختبارات خدمة الإشعارات
 */

import { describe, it, expect } from 'vitest';

describe('Notification Service', () => {
  it('notification service module should be importable', async () => {
    const module = await import('@/services/notification.service');
    expect(module).toBeDefined();
  });

  it('should have NotificationService class', async () => {
    const { NotificationService } = await import('@/services/notification.service');
    expect(NotificationService).toBeDefined();
  });

  it('should have send method', async () => {
    const { NotificationService } = await import('@/services/notification.service');
    expect(typeof NotificationService.send).toBe('function');
  });

  it('should have sendBulk method', async () => {
    const { NotificationService } = await import('@/services/notification.service');
    expect(typeof NotificationService.sendBulk).toBe('function');
  });

  it('should have getSystemAlerts method', async () => {
    const { NotificationService } = await import('@/services/notification.service');
    expect(typeof NotificationService.getSystemAlerts).toBe('function');
  });

  it('should have getUserNotifications method', async () => {
    const { NotificationService } = await import('@/services/notification.service');
    expect(typeof NotificationService.getUserNotifications).toBe('function');
  });

  it('should have markAsRead method', async () => {
    const { NotificationService } = await import('@/services/notification.service');
    expect(typeof NotificationService.markAsRead).toBe('function');
  });

  it('should have sendBroadcast method', async () => {
    const { NotificationService } = await import('@/services/notification.service');
    expect(typeof NotificationService.sendBroadcast).toBe('function');
  });
});
