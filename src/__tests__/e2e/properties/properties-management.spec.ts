import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { navigateTo } from '../helpers/navigation-helpers';
import { expectVisible, expectToast } from '../helpers/assertion-helpers';
import { fillAndSubmit } from '../helpers/form-helpers';

test.describe('إدارة العقارات', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await navigateTo(page, '/properties');
  });

  test('عرض قائمة العقارات', async ({ page }) => {
    await expectVisible(page, 'text=إدارة العقارات');
    await expectVisible(page, 'button:has-text("عقار جديد")');
    
    const propertiesCount = await page.locator('[data-testid="property-card"]').count();
    expect(propertiesCount).toBeGreaterThan(0);
  });

  test('فلترة العقارات حسب النوع', async ({ page }) => {
    await page.click('button:has-text("فلترة")');
    await page.click('text=عمارة سكنية');
    await page.waitForTimeout(1000);
    
    const filteredCount = await page.locator('[data-testid="property-card"]').count();
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('عرض تفاصيل عقار', async ({ page }) => {
    await page.locator('[data-testid="property-card"]').first().click();
    
    await expectVisible(page, 'text=تفاصيل العقار');
    await expectVisible(page, 'text=المعلومات الأساسية');
    await expectVisible(page, 'text=العقود');
    await expectVisible(page, 'text=الإيرادات');
  });

  test('إضافة عقار جديد', async ({ page }) => {
    await page.click('button:has-text("عقار جديد")');
    
    await page.fill('input[name="name"]', 'عقار اختبار جديد');
    await page.fill('input[name="location"]', 'الرياض - حي الملك فهد');
    await page.click('button:has-text("حفظ")');
    
    await expectToast(page, 'تم إضافة العقار بنجاح');
  });

  test('إضافة عقد إيجار', async ({ page }) => {
    await page.locator('[data-testid="property-card"]').first().click();
    await page.click('text=العقود');
    await page.click('button:has-text("عقد جديد")');
    
    await expectVisible(page, 'text=عقد إيجار جديد');
    await expectVisible(page, 'input[name="tenant_name"]');
  });

  test('عرض جدول الصيانة', async ({ page }) => {
    await page.locator('[data-testid="property-card"]').first().click();
    await page.click('text=الصيانة');
    
    await expectVisible(page, 'text=جدول الصيانة');
    await expectVisible(page, 'button:has-text("طلب صيانة")');
  });
});
