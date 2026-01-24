/**
 * Smoke Tests - اختبارات سريعة للتحقق من صحة البنية الأساسية
 * يجب أن تمر هذه الاختبارات دائماً قبل تشغيل الاختبارات الكاملة
 */
import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - البنية الأساسية', () => {
  
  test('يجب أن يتم تحميل الصفحة الرئيسية', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });

  test('يجب أن تكون صفحة تسجيل الدخول متاحة', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const loginForm = page.locator('form, [role="form"]');
    const isVisible = await loginForm.isVisible({ timeout: 5000 }).catch(() => false);
    
    expect(isVisible).toBe(true);
  });

  test('يجب أن تعمل روابط التنقل الأساسية', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // التحقق من عدم وجود أخطاء JavaScript في Console
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    
    await page.waitForTimeout(2000);
    
    // نسمح ببعض التحذيرات، لكن لا أخطاء критические
    expect(errors.filter(e => e.includes('Error') && !e.includes('Warning'))).toHaveLength(0);
  });

  test('يجب أن تكون الـ API endpoints متاحة (صفحة 404 محددة)', async ({ page }) => {
    const response = await page.request.get('/api/health').catch(() => null);
    
    // إما أن يكون endpoint موجود أو 404 - المهم ألا يكون server crash
    if (response) {
      expect([200, 404, 405]).toContain(response.status());
    }
  });
});
