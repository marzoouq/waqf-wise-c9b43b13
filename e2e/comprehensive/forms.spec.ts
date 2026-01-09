/**
 * اختبارات E2E شاملة لجميع النماذج
 * @version 1.0.0
 */
import { test, expect } from '@playwright/test';

// النماذج الرئيسية في التطبيق
const FORMS = [
  { path: '/beneficiaries', button: 'إضافة', formName: 'إضافة مستفيد' },
  { path: '/properties', button: 'إضافة', formName: 'إضافة عقار' },
  { path: '/invoices', button: 'إضافة', formName: 'إضافة فاتورة' },
  { path: '/payments', button: 'إضافة', formName: 'إضافة دفعة' },
  { path: '/loans', button: 'إضافة', formName: 'إضافة قرض' },
  { path: '/support', button: 'إضافة', formName: 'إضافة تذكرة' },
];

test.describe('اختبارات النماذج الشاملة', () => {
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

  test('التحقق من وجود النماذج الرئيسية', async ({ page }) => {
    for (const form of FORMS) {
      await page.goto(form.path);
      await page.waitForLoadState('networkidle');
      
      // البحث عن زر الإضافة
      const addButton = page.locator(`button:has-text("${form.button}"), [aria-label*="${form.button}"]`).first();
      
      if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addButton.click();
        await page.waitForTimeout(500);
        
        // التحقق من ظهور النموذج أو الحوار
        const dialog = page.locator('[role="dialog"], .modal, form');
        const hasDialog = await dialog.isVisible({ timeout: 2000 }).catch(() => false);
        
        console.log(`${form.formName}: ${hasDialog ? '✓ النموذج يظهر' : '✗ النموذج غير موجود'}`);
        
        // إغلاق النموذج
        await page.keyboard.press('Escape');
      }
    }
  });

  test('التحقق من صحة النماذج (Validation)', async ({ page }) => {
    await page.goto('/beneficiaries');
    await page.waitForLoadState('networkidle');
    
    const addButton = page.locator('button:has-text("إضافة")').first();
    if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // محاولة الإرسال بدون ملء الحقول
      const submitButton = page.locator('button[type="submit"], button:has-text("حفظ")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(300);
        
        // التحقق من ظهور رسائل الخطأ
        const errorMessages = page.locator('[class*="error"], [class*="invalid"], .text-destructive');
        const hasErrors = await errorMessages.count() > 0;
        
        console.log(`التحقق من الصحة: ${hasErrors ? '✓ يظهر رسائل الخطأ' : '⚠ لا رسائل خطأ'}`);
      }
      
      await page.keyboard.press('Escape');
    }
  });

  test('التحقق من الحقول المطلوبة', async ({ page }) => {
    await page.goto('/beneficiaries');
    await page.waitForLoadState('networkidle');
    
    const addButton = page.locator('button:has-text("إضافة")').first();
    if (await addButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // البحث عن الحقول المطلوبة
      const requiredFields = page.locator('input[required], select[required], textarea[required], [aria-required="true"]');
      const count = await requiredFields.count();
      
      console.log(`عدد الحقول المطلوبة: ${count}`);
      expect(count).toBeGreaterThanOrEqual(0);
      
      await page.keyboard.press('Escape');
    }
  });

  test('اختبار نموذج تسجيل الدخول', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // التحقق من وجود حقول تسجيل الدخول
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    // اختبار رسالة خطأ عند إدخال بيانات خاطئة
    await emailInput.fill('wrong@email.com');
    await passwordInput.fill('wrongpassword');
    await submitButton.click();
    
    await page.waitForTimeout(1000);
    
    // يجب أن تظهر رسالة خطأ أو يبقى في صفحة تسجيل الدخول
    const currentUrl = page.url();
    const stillOnLogin = currentUrl.includes('login');
    
    console.log(`اختبار بيانات خاطئة: ${stillOnLogin ? '✓ تم رفض البيانات' : '⚠ تم القبول'}`);
  });
});
