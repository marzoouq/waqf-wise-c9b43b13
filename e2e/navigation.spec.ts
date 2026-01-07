/**
 * E2E Tests - Navigation
 * @version 1.0.0
 */
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/وقف|Waqf/i);
  });

  test('should have main navigation elements', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav, header');
    await expect(nav).toBeVisible();
  });

  test('should navigate to login from landing', async ({ page }) => {
    await page.goto('/');
    const loginBtn = page.locator('a[href*="login"], button:has-text("تسجيل"), button:has-text("Login")');
    if (await loginBtn.first().isVisible()) {
      await loginBtn.first().click();
      await expect(page).toHaveURL(/login/);
    }
  });

  test('should show 404 for unknown routes', async ({ page }) => {
    await page.goto('/unknown-route-12345');
    await expect(page.locator('body')).toContainText(/404|غير موجود|Not Found/i);
  });
});
