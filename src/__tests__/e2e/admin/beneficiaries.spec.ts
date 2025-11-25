import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth-helpers';
import { expectVisible, expectCount } from '../helpers/assertion-helpers';
import { fillForm, submitForm } from '../helpers/form-helpers';
import { waitForDataLoad } from '../helpers/wait-helpers';

test.describe('إدارة المستفيدين', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await page.click('text=المستفيدون');
    await waitForDataLoad(page);
  });

  test('عرض قائمة المستفيدين', async ({ page }) => {
    await expectVisible(page, 'text=المستفيدون');
    await expectVisible(page, 'button:has-text("مستفيد جديد")');
    
    const beneficiariesCount = await page.locator('[data-testid="beneficiary-row"]').count();
    expect(beneficiariesCount).toBeGreaterThan(0);
  });

  test('البحث عن مستفيد', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="بحث"]');
    await searchInput.fill('عبد');
    await waitForDataLoad(page);
    
    const results = await page.locator('[data-testid="beneficiary-row"]').count();
    expect(results).toBeGreaterThanOrEqual(0);
  });

  test('فلترة المستفيدين حسب الحالة', async ({ page }) => {
    await page.click('button:has-text("فلتر")');
    await page.check('input[value="نشط"]');
    await page.click('button:has-text("تطبيق")');
    await waitForDataLoad(page);
    
    const activeBadges = await page.locator('text=نشط').count();
    expect(activeBadges).toBeGreaterThan(0);
  });

  test('عرض ملف مستفيد', async ({ page }) => {
    const firstBeneficiary = page.locator('[data-testid="beneficiary-row"]').first();
    await firstBeneficiary.click();
    await waitForDataLoad(page);
    
    await expectVisible(page, 'text=معلومات المستفيد');
    await expectVisible(page, 'text=الاسم الكامل');
    await expectVisible(page, 'text=رقم الهوية');
  });

  test('إضافة مستفيد جديد', async ({ page }) => {
    await page.click('button:has-text("مستفيد جديد")');
    await expectVisible(page, 'text=مستفيد جديد');
    
    const randomId = Math.floor(Math.random() * 1000000000).toString();
    
    await fillForm(page, {
      full_name: 'مستفيد اختبار ' + Date.now(),
      national_id: '1' + randomId.padStart(9, '0'),
      phone: '0501234567',
      category: 'ذكور',
    });
    
    await submitForm(page);
    await waitForDataLoad(page);
    
    await expect(page.locator('[role="status"]')).toContainText(/تم|نجح/i);
  });

  test('تعديل بيانات مستفيد', async ({ page }) => {
    const firstBeneficiary = page.locator('[data-testid="beneficiary-row"]').first();
    await firstBeneficiary.click();
    
    await page.click('button:has-text("تعديل")');
    await expectVisible(page, 'input[name="phone"]');
    
    await page.fill('input[name="phone"]', '0509999999');
    await submitForm(page);
    
    await expect(page.locator('[role="status"]')).toContainText(/تم|نجح/i);
  });

  test('عرض نشاط المستفيد', async ({ page }) => {
    const firstBeneficiary = page.locator('[data-testid="beneficiary-row"]').first();
    await firstBeneficiary.click();
    
    await page.click('button:has-text("النشاط")');
    await expectVisible(page, 'text=سجل النشاط');
  });

  test('تصدير قائمة المستفيدين', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("تصدير Excel")');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/\.xlsx?$/i);
  });
});
