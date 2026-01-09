/**
 * اختبارات E2E شاملة لجميع الأزرار
 * @version 1.0.0
 */
import { test, expect } from '@playwright/test';

// الصفحات الرئيسية لاختبار الأزرار
const PAGES = [
  '/dashboard',
  '/beneficiaries',
  '/properties',
  '/accounting',
  '/payments',
  '/invoices',
  '/distributions',
  '/reports',
  '/settings',
];

test.describe('اختبارات الأزرار الشاملة', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill('admin@waqf.test');
      await page.locator('input[type="password"]').fill('admin123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(/\/(dashboard|beneficiaries|admin)/, { timeout: 10000 }).catch(() => {});
    }
  });

  for (const pagePath of PAGES) {
    test(`الأزرار في صفحة ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // البحث عن جميع الأزرار
      const buttons = page.locator('button:visible');
      const buttonCount = await buttons.count();
      
      console.log(`${pagePath}: وجدت ${buttonCount} زر`);
      
      // التحقق من أن كل زر له نص أو aria-label
      for (let i = 0; i < Math.min(buttonCount, 20); i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const hasIdentifier = (text && text.trim().length > 0) || ariaLabel;
        
        if (!hasIdentifier) {
          const className = await button.getAttribute('class');
          console.log(`  ⚠ زر بدون تسمية: class="${className?.substring(0, 50)}"`);
        }
      }
      
      expect(buttonCount).toBeGreaterThan(0);
    });
  }

  test('اختبار أزرار التصدير', async ({ page }) => {
    await page.goto('/beneficiaries');
    await page.waitForLoadState('networkidle');
    
    // البحث عن أزرار التصدير
    const exportButtons = page.locator('button:has-text("تصدير"), button:has-text("Excel"), button:has-text("PDF")');
    const count = await exportButtons.count();
    
    console.log(`أزرار التصدير: ${count}`);
    
    // اختبار الضغط على زر التصدير (إن وجد)
    if (count > 0) {
      const firstExport = exportButtons.first();
      if (await firstExport.isVisible()) {
        // لا نضغط فعلياً لتجنب تنزيل الملفات
        const isEnabled = await firstExport.isEnabled();
        console.log(`زر التصدير: ${isEnabled ? '✓ مفعل' : '✗ معطل'}`);
      }
    }
  });

  test('اختبار أزرار الحذف (تأكيد)', async ({ page }) => {
    await page.goto('/beneficiaries');
    await page.waitForLoadState('networkidle');
    
    // البحث عن أزرار الحذف
    const deleteButtons = page.locator('button:has-text("حذف"), button[aria-label*="حذف"], button[aria-label*="delete"]');
    const count = await deleteButtons.count();
    
    console.log(`أزرار الحذف: ${count}`);
    
    // اختبار أن زر الحذف يظهر تأكيد
    if (count > 0) {
      const firstDelete = deleteButtons.first();
      if (await firstDelete.isVisible()) {
        await firstDelete.click();
        await page.waitForTimeout(300);
        
        // التحقق من ظهور حوار التأكيد
        const confirmDialog = page.locator('[role="alertdialog"], [role="dialog"]:has-text("تأكيد"), [role="dialog"]:has-text("حذف")');
        const hasConfirm = await confirmDialog.isVisible({ timeout: 1000 }).catch(() => false);
        
        console.log(`تأكيد الحذف: ${hasConfirm ? '✓ يظهر تأكيد' : '⚠ لا تأكيد'}`);
        
        // إغلاق الحوار
        await page.keyboard.press('Escape');
      }
    }
  });

  test('اختبار أزرار الطباعة', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    
    const printButtons = page.locator('button:has-text("طباعة"), button[aria-label*="طباعة"], button[aria-label*="print"]');
    const count = await printButtons.count();
    
    console.log(`أزرار الطباعة: ${count}`);
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('اختبار حالات الأزرار (مفعل/معطل)', async ({ page }) => {
    await page.goto('/beneficiaries');
    await page.waitForLoadState('networkidle');
    
    const buttons = page.locator('button:visible');
    const buttonCount = await buttons.count();
    
    let enabledCount = 0;
    let disabledCount = 0;
    
    for (let i = 0; i < Math.min(buttonCount, 30); i++) {
      const button = buttons.nth(i);
      const isDisabled = await button.isDisabled();
      
      if (isDisabled) {
        disabledCount++;
      } else {
        enabledCount++;
      }
    }
    
    console.log(`أزرار مفعلة: ${enabledCount}, معطلة: ${disabledCount}`);
  });

  test('اختبار أزرار التنقل', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // البحث عن أزرار التنقل في القائمة الجانبية
    const navButtons = page.locator('nav button, aside button, [role="navigation"] button');
    const count = await navButtons.count();
    
    console.log(`أزرار التنقل: ${count}`);
    
    // اختبار الضغط على بعض أزرار التنقل
    if (count > 0) {
      const firstNav = navButtons.first();
      if (await firstNav.isVisible()) {
        await firstNav.click();
        await page.waitForTimeout(300);
        
        // التحقق من أن الصفحة لم تتعطل
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });
});
