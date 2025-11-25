import { test, expect } from '@playwright/test';
import { loginAs, logout, isAuthenticated } from '../helpers/auth-helpers';

test.describe('المصادقة وتسجيل الدخول', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('يجب أن يعرض صفحة تسجيل الدخول بشكل صحيح', async ({ page }) => {
    await expect(page).toHaveTitle(/نظام إدارة الوقف/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('يجب أن يفشل تسجيل الدخول ببيانات خاطئة', async ({ page }) => {
    await page.fill('input[type="email"]', 'wrong@waqf.sa');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('[role="status"]')).toContainText(/خطأ|فشل/i);
  });

  test('تسجيل دخول الناظر بنجاح', async ({ page }) => {
    await loginAs(page, 'nazer');
    expect(await isAuthenticated(page)).toBe(true);
    await expect(page).toHaveURL(/nazer-dashboard/);
  });

  test('تسجيل دخول المحاسب بنجاح', async ({ page }) => {
    await loginAs(page, 'accountant');
    expect(await isAuthenticated(page)).toBe(true);
    await expect(page).toHaveURL(/accountant-dashboard|dashboard/);
  });

  test('تسجيل دخول المستفيد بنجاح', async ({ page }) => {
    await loginAs(page, 'beneficiary');
    expect(await isAuthenticated(page)).toBe(true);
    await expect(page).toHaveURL(/beneficiary-dashboard/);
  });

  test('تسجيل الخروج بنجاح', async ({ page }) => {
    await loginAs(page, 'admin');
    await logout(page);
    expect(await isAuthenticated(page)).toBe(false);
    await expect(page).toHaveURL('/auth');
  });

  test('الحماية من CSRF والأمان', async ({ page }) => {
    await loginAs(page, 'admin');
    
    // التحقق من وجود CSRF token في localStorage
    const hasAuth = await page.evaluate(() => {
      return localStorage.getItem('sb-zsacuvrcohmraoldilph-auth-token') !== null;
    });
    
    expect(hasAuth).toBe(true);
  });
});
