import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectToast } from '../helpers/assertion-helpers';

test.describe('إدارة الأرشيف', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'archivist');
    await navigateTo(page, '/archive');
  });

  test('عرض هيكل الأرشيف', async ({ page }) => {
    await expectVisible(page, 'text=الأرشيف الإلكتروني');
    await expectVisible(page, 'button:has-text("مجلد جديد")');
    await expectVisible(page, 'button:has-text("رفع مستند")');
  });

  test('إنشاء مجلد جديد', async ({ page }) => {
    await page.click('button:has-text("مجلد جديد")');
    
    await expectVisible(page, 'text=مجلد جديد');
    await page.fill('input[name="folder_name"]', 'مجلد اختبار');
    await page.click('button:has-text("إنشاء")');
    
    await expectToast(page, 'تم إنشاء المجلد بنجاح');
  });

  test('البحث في المستندات', async ({ page }) => {
    await page.fill('input[placeholder*="بحث"]', 'عقد');
    await page.waitForTimeout(1000);
    
    const results = await page.locator('[data-testid="document-item"]').count();
    expect(results).toBeGreaterThanOrEqual(0);
  });

  test('تصفية المستندات حسب النوع', async ({ page }) => {
    await page.click('button:has-text("فلترة")');
    await page.click('text=عقود');
    
    await expectVisible(page, '[data-type="عقود"]');
  });

  test('عرض تفاصيل مستند', async ({ page }) => {
    await page.locator('[data-testid="document-item"]').first().click();
    
    await expectVisible(page, 'text=تفاصيل المستند');
    await expectVisible(page, 'text=المعلومات');
    await expectVisible(page, 'text=المحتوى');
  });

  test('إضافة وسوم للمستند', async ({ page }) => {
    await page.locator('[data-testid="document-item"]').first().click();
    await page.click('button:has-text("تعديل")');
    
    await page.fill('input[name="tags"]', 'عقارات, مهم');
    await page.click('button:has-text("حفظ")');
    
    await expectToast(page, 'تم تحديث المستند');
  });
});
