import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible } from '../helpers/assertion-helpers';

test.describe('إدارة النظام', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('إدارة المستخدمين', async ({ page }) => {
    await navigateTo(page, '/users');
    
    await expectVisible(page, 'text=إدارة المستخدمين');
    await expectVisible(page, 'button:has-text("مستخدم جديد")');
    
    const usersCount = await page.locator('[data-testid="user-row"]').count();
    expect(usersCount).toBeGreaterThan(0);
  });

  test('سجل العمليات', async ({ page }) => {
    await navigateTo(page, '/audit-logs');
    
    await expectVisible(page, 'text=سجل العمليات');
    await expectVisible(page, '[data-testid="audit-log-item"]');
  });

  test('لوحة المراقبة', async ({ page }) => {
    await navigateTo(page, '/monitoring');
    
    await expectVisible(page, 'text=لوحة المراقبة');
    await expectVisible(page, 'text=الأخطاء');
    await expectVisible(page, 'text=التنبيهات');
  });

  test('سجلات الأخطاء', async ({ page }) => {
    await navigateTo(page, '/error-logs');
    
    await expectVisible(page, 'text=سجلات الأخطاء');
    await expectVisible(page, '[data-testid="error-log-item"]');
  });

  test('صيانة النظام', async ({ page }) => {
    await navigateTo(page, '/maintenance');
    
    await expectVisible(page, 'text=صيانة النظام');
    await expectVisible(page, 'text=النسخ الاحتياطي');
    await expectVisible(page, 'text=التحديثات');
  });

  test('الإعدادات العامة', async ({ page }) => {
    await navigateTo(page, '/settings');
    
    await expectVisible(page, 'text=الإعدادات العامة');
    await expectVisible(page, 'text=معلومات الوقف');
    await expectVisible(page, 'text=إعدادات النظام');
  });

  test('الإشعارات', async ({ page }) => {
    await navigateTo(page, '/notifications');
    
    await expectVisible(page, 'text=الإشعارات');
    
    const notificationsCount = await page.locator('[data-testid="notification-item"]').count();
    expect(notificationsCount).toBeGreaterThanOrEqual(0);
  });
});
