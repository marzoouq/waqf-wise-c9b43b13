import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';

test.describe('Archivist Document Management', () => {
  test('Complete archivist archiving workflow', async ({ page }) => {
    // 1. تسجيل الدخول كأرشيفي
    await loginAs(page, 'archivist');
    
    // 2. التحقق من الوصول إلى لوحة تحكم الأرشيفي
    await expect(page).toHaveURL(/\/archivist-dashboard/);
    await expect(page.locator('h1')).toContainText('لوحة تحكم الأرشيفي');
    
    // 3. عرض إحصائيات الأرشيف
    await expect(page.locator('[data-testid="archive-stats"]')).toBeVisible();
    
    // 4. الانتقال إلى الأرشيف
    await navigateTo(page, '/archive');
    
    // 5. إنشاء مجلد جديد
    await page.click('button:has-text("مجلد جديد")');
    await page.fill('[name="name"]', 'عقود 2025');
    await page.fill('[name="description"]', 'عقود الإيجار لعام 2025');
    await page.click('button:has-text("إنشاء")');
    await expect(page.locator('text=تم إنشاء المجلد')).toBeVisible();
    
    // 6. رفع مستند
    await page.click('button:has-text("رفع مستند")');
    await page.fill('[name="name"]', 'عقد رقم 001');
    await page.selectOption('[name="category"]', 'contracts');
    await page.fill('[name="description"]', 'عقد إيجار محل تجاري');
    // محاكاة رفع ملف
    await page.click('button:has-text("حفظ")');
    await expect(page.locator('text=تم رفع المستند')).toBeVisible();
    
    // 7. البحث عن مستند
    await page.fill('[data-testid="search-input"]', 'عقد');
    await page.click('button:has-text("بحث")');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // 8. عرض تفاصيل المستند
    await page.click('[data-testid="document-item"]:first-child');
    await expect(page.locator('[data-testid="document-preview"]')).toBeVisible();
    
    // 9. تسجيل الخروج
    await logout(page);
  });
  
  test('Document categorization and tagging', async ({ page }) => {
    await loginAs(page, 'archivist');
    
    await navigateTo(page, '/archive');
    
    // تصنيف مستند
    await page.click('[data-testid="document-item"]:first-child');
    await page.click('button:has-text("تعديل")');
    
    // إضافة تصنيفات
    await page.fill('[name="tags"]', 'عقود, إيجار, 2025');
    await page.click('button:has-text("حفظ")');
    
    await expect(page.locator('text=تم تحديث المستند')).toBeVisible();
    
    await logout(page);
  });
});
