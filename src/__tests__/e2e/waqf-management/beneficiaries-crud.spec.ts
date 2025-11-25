import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectToast } from '../helpers/assertion-helpers';
import { fillAndSubmit } from '../helpers/form-helpers';

test.describe('إدارة المستفيدين - العمليات الكاملة', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/beneficiaries');
  });

  test('عرض قائمة المستفيدين مع البيانات', async ({ page }) => {
    await expectVisible(page, 'text=إدارة المستفيدين');
    await expectVisible(page, 'button:has-text("مستفيد جديد")');
    
    // التحقق من وجود بيانات
    const rowCount = await page.locator('[data-testid="beneficiary-row"]').count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('البحث عن مستفيد بالاسم', async ({ page }) => {
    await page.fill('input[placeholder*="بحث"]', 'أحمد');
    await page.waitForTimeout(1000);
    
    const results = await page.locator('[data-testid="beneficiary-row"]').count();
    expect(results).toBeGreaterThan(0);
  });

  test('فلترة المستفيدين حسب الفئة', async ({ page }) => {
    await page.click('button:has-text("فلترة")');
    await page.click('text=أسر منتجة');
    await page.waitForTimeout(1000);
    
    await expectVisible(page, 'text=أسر منتجة');
  });

  test('إضافة مستفيد جديد', async ({ page }) => {
    await page.click('button:has-text("مستفيد جديد")');
    
    await page.fill('input[name="full_name"]', 'مستفيد اختبار جديد');
    await page.fill('input[name="national_id"]', '9876543210');
    await page.fill('input[name="phone"]', '0509876543');
    await page.click('button:has-text("حفظ")');
    
    await expectToast(page, 'تم إضافة المستفيد بنجاح');
  });

  test('تعديل بيانات مستفيد', async ({ page }) => {
    // النقر على أول مستفيد
    await page.locator('[data-testid="beneficiary-row"]').first().click();
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("تعديل")');
    
    await page.fill('input[name="phone"]', '0501111111');
    await page.click('button:has-text("حفظ")');
    
    await expectToast(page, 'تم تحديث البيانات بنجاح');
  });

  test('عرض سجل نشاط المستفيد', async ({ page }) => {
    await page.locator('[data-testid="beneficiary-row"]').first().click();
    await page.click('button:has-text("سجل النشاط")');
    
    await expectVisible(page, 'text=سجل النشاط');
    await expectVisible(page, '[data-testid="activity-item"]');
  });

  test('إضافة مرفق للمستفيد', async ({ page }) => {
    await page.locator('[data-testid="beneficiary-row"]').first().click();
    await page.click('button:has-text("المرفقات")');
    await page.click('button:has-text("إضافة مرفق")');
    
    await expectVisible(page, 'text=إضافة مرفق');
  });
});
