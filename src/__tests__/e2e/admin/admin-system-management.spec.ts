import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';

test.describe('Admin System Management', () => {
  test('Complete admin configuration workflow', async ({ page }) => {
    // 1. تسجيل الدخول كمشرف
    await loginAs(page, 'admin');
    
    // 2. التحقق من الوصول إلى لوحة تحكم المشرف
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1')).toContainText('لوحة التحكم');
    
    // 3. عرض KPIs الإدارية
    await expect(page.locator('[data-testid="admin-kpis"]')).toBeVisible();
    
    // 4. الانتقال إلى إدارة المستخدمين
    await navigateTo(page, '/users');
    
    // 5. عرض قائمة المستخدمين
    await expect(page.locator('[data-testid="users-list"]')).toBeVisible();
    
    // 6. إضافة مستخدم جديد
    await page.click('button:has-text("إضافة مستخدم")');
    await page.fill('[name="name"]', 'موظف اختبار');
    await page.fill('[name="email"]', 'test@waqf.sa');
    await page.selectOption('[name="role"]', 'archivist');
    await page.click('button:has-text("حفظ")');
    await expect(page.locator('text=تم إضافة المستخدم')).toBeVisible();
    
    // 7. عرض سجلات المراجعة
    await navigateTo(page, '/audit-logs');
    await expect(page.locator('[data-testid="audit-logs"]')).toBeVisible();
    
    // 8. تصفية السجلات
    await page.selectOption('[name="action_type"]', 'create');
    await page.click('button:has-text("تطبيق")');
    
    // 9. الانتقال إلى الإعدادات
    await navigateTo(page, '/settings');
    
    // 10. تعديل إعدادات النظام
    await page.click('text=إعدادات عامة');
    await page.fill('[name="organization_name"]', 'وقف اختبار');
    await page.click('button:has-text("حفظ الإعدادات")');
    await expect(page.locator('text=تم حفظ الإعدادات')).toBeVisible();
    
    // 11. تسجيل الخروج
    await logout(page);
  });
  
  test('View AI insights and smart alerts', async ({ page }) => {
    await loginAs(page, 'admin');
    
    // عرض AI Insights
    await navigateTo(page, '/ai-insights');
    await expect(page.locator('[data-testid="ai-insights"]')).toBeVisible();
    
    // عرض التنبيهات الذكية
    await expect(page.locator('[data-testid="smart-alerts"]')).toBeVisible();
    
    // تفاعل مع تنبيه
    await page.click('[data-testid="alert-item"]:first-child');
    await expect(page.locator('[data-testid="alert-details"]')).toBeVisible();
    
    await logout(page);
  });
});
