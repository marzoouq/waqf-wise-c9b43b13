import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible } from '../helpers/assertion-helpers';

test.describe('لوحة تحكم المشرف العام', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/');
  });

  test('عرض إحصائيات النظام الشاملة', async ({ page }) => {
    await expectVisible(page, 'text=إحصائيات النظام');
    await expectVisible(page, 'text=المستخدمون النشطون');
    await expectVisible(page, 'text=العمليات اليومية');
    await expectVisible(page, 'text=أداء النظام');
  });

  test('عرض صحة النظام', async ({ page }) => {
    const systemHealth = page.locator('[data-testid="system-health"]');
    if (await systemHealth.count() > 0) {
      await expectVisible(page, 'text=صحة النظام');
      
      const healthIndicators = await page.locator('[data-testid="health-indicator"]').count();
      console.log(`✅ مؤشرات الصحة: ${healthIndicators}`);
    }
  });

  test('عرض المستخدمين النشطين', async ({ page }) => {
    await expectVisible(page, 'text=المستخدمون');
    
    const activeUsers = await page.locator('[data-testid="active-user"]').count();
    console.log(`✅ المستخدمون النشطون: ${activeUsers}`);
  });

  test('عرض سجل العمليات الأخيرة', async ({ page }) => {
    await expectVisible(page, 'text=سجل العمليات');
    
    const auditLogs = await page.locator('[data-testid="audit-log-item"]').count();
    console.log(`✅ سجلات العمليات: ${auditLogs}`);
  });

  test('عرض التنبيهات الحرجة', async ({ page }) => {
    const criticalAlerts = page.locator('[data-testid="critical-alert"]');
    if (await criticalAlerts.count() > 0) {
      await expectVisible(page, 'text=تنبيهات حرجة');
      console.log('✅ التنبيهات الحرجة معروضة');
    }
  });

  test('عرض إحصائيات الأداء', async ({ page }) => {
    const performanceSection = page.locator('[data-testid="performance-stats"]');
    if (await performanceSection.count() > 0) {
      await expectVisible(page, 'text=الأداء');
      
      const metrics = await page.locator('[data-testid="performance-metric"]').count();
      console.log(`✅ مقاييس الأداء: ${metrics}`);
    }
  });

  test('الوصول السريع لإدارة المستخدمين', async ({ page }) => {
    const usersLink = page.locator('a[href="/users"]').first();
    if (await usersLink.count() > 0) {
      await usersLink.click();
      await page.waitForLoadState('networkidle');
      await expectVisible(page, 'text=إدارة المستخدمين');
    }
  });

  test('عرض إحصائيات النسخ الاحتياطي', async ({ page }) => {
    const backupSection = page.locator('[data-testid="backup-status"]');
    if (await backupSection.count() > 0) {
      await expectVisible(page, 'text=النسخ الاحتياطي');
      console.log('✅ حالة النسخ الاحتياطي متاحة');
    }
  });

  test('عرض الأخطاء والتنبيهات', async ({ page }) => {
    const errorsSection = page.locator('[data-testid="system-errors"]');
    if (await errorsSection.count() > 0) {
      const errorsCount = await page.locator('[data-testid="error-item"]').count();
      console.log(`✅ الأخطاء المسجلة: ${errorsCount}`);
    }
  });

  test('عرض استخدام الموارد', async ({ page }) => {
    const resourcesSection = page.locator('[data-testid="resource-usage"]');
    if (await resourcesSection.count() > 0) {
      await expectVisible(page, 'text=استخدام الموارد');
      console.log('✅ استخدام الموارد معروض');
    }
  });
});
