import { test, expect, waitForPageStability } from '../fixtures/visual-test.fixture';
import { Page } from '@playwright/test';

/**
 * Components Visual Regression Tests
 * اختبارات Visual Regression للمكونات المشتركة
 */

test.describe('Shared Components Visual Tests', () => {

  test.use({
    viewport: { width: 1280, height: 800 },
  });

  /* =========================
     Buttons
  ========================= */
  test.describe('Buttons', () => {

    test.beforeEach(async ({ page }: { page: Page }) => {
      await page.goto('/');
      await waitForPageStability(page);
    });

    test('primary button default @visual', async ({ page }: { page: Page }) => {
      const primaryBtn = page
        .locator('button, a')
        .filter({ hasText: /تسجيل|دخول|ابدأ/ })
        .first();

      await expect(primaryBtn).toBeVisible();

      await expect(primaryBtn).toHaveScreenshot(
        'component-btn-primary.png',
        { animations: 'disabled' }
      );
    });

    test('primary button hover @visual', async ({ page }: { page: Page }) => {
      const primaryBtn = page
        .locator('button, a')
        .filter({ hasText: /تسجيل|دخول|ابدأ/ })
        .first();

      await expect(primaryBtn).toBeVisible();

      await page.mouse.move(0, 0);
      await primaryBtn.hover();

      await expect(primaryBtn).toHaveScreenshot(
        'component-btn-primary-hover.png',
        { animations: 'disabled' }
      );
    });
  });

  /* =========================
     Form Inputs
  ========================= */
  test.describe('Form Inputs', () => {

    test.beforeEach(async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await waitForPageStability(page);
    });

    test('text input states @visual', async ({ page }: { page: Page }) => {
      const input = page
        .locator('input[type="email"], input[type="text"]')
        .first();

      await expect(input).toBeVisible();

      // Empty
      await expect(input).toHaveScreenshot(
        'component-input-empty.png',
        { animations: 'disabled' }
      );

      // Filled
      await input.fill('نص تجريبي');
      await expect(input).toHaveScreenshot(
        'component-input-filled.png',
        { animations: 'disabled' }
      );

      // Focused
      await input.focus();
      await expect(input).toHaveScreenshot(
        'component-input-focused.png',
        { animations: 'disabled' }
      );
    });

    test('password input with toggle @visual', async ({ page }: { page: Page }) => {
      const passwordField = page
        .locator('input[type="password"]')
        .first();

      await expect(passwordField).toBeVisible();

      const wrapper = passwordField.locator('..');

      await expect(wrapper).toHaveScreenshot(
        'component-password-input.png',
        { animations: 'disabled' }
      );
    });
  });

  /* =========================
     Tabs
  ========================= */
  test.describe('Tabs', () => {

    test.beforeEach(async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await waitForPageStability(page);
    });

    test('tabs default state @visual', async ({ page }: { page: Page }) => {
      const tabs = page.locator('[role="tablist"]').first();

      await expect(tabs).toBeVisible();

      await expect(tabs).toHaveScreenshot(
        'component-tabs-default.png',
        { animations: 'disabled' }
      );
    });

    test('tabs second tab active @visual', async ({ page }: { page: Page }) => {
      const tabs = page.locator('[role="tablist"]').first();
      const secondTab = page.locator('[role="tab"]').nth(1);

      await expect(tabs).toBeVisible();
      await expect(secondTab).toBeVisible();

      await secondTab.click();

      await expect(secondTab).toHaveAttribute('aria-selected', 'true');

      await expect(tabs).toHaveScreenshot(
        'component-tabs-active-second.png',
        { animations: 'disabled' }
      );
    });
  });

  /* =========================
     Cards
  ========================= */
  test.describe('Cards', () => {

    test('card component @visual', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await waitForPageStability(page);

      const card = page
        .locator('[class*="card"], [class*="Card"]')
        .first();

      await expect(card).toBeVisible();

      await expect(card).toHaveScreenshot(
        'component-card.png',
        { animations: 'disabled' }
      );
    });
  });

  /* =========================
     Loading States
  ========================= */
  test.describe('Loading States', () => {

    test('submit button loading state @visual', async ({ page }: { page: Page }) => {
      await page.goto('/login');
      await waitForPageStability(page);

      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitBtn = page.locator('button[type="submit"]').first();

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(submitBtn).toBeVisible();

      await emailInput.fill('test@test.com');
      await passwordInput.fill('password123');

      await submitBtn.click();

      const loadingBtn = page.locator(
        'button[aria-busy="true"], button:has([class*="animate"])'
      );

      await expect(loadingBtn).toBeVisible({ timeout: 1500 });

      await expect(loadingBtn).toHaveScreenshot(
        'component-btn-loading.png',
        { animations: 'disabled' }
      );
    });
  });
});
