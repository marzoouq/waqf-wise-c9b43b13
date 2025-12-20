import { test, expect, fullPageOptions, waitForPageStability } from '../fixtures/visual-test.fixture';

/**
 * Components Visual Regression Tests
 * اختبارات Visual Regression للمكونات المشتركة
 */

test.describe('Shared Components Visual Tests', () => {
  
  test.describe('Buttons', () => {
    test('primary button on landing @visual', async ({ page }) => {
      await page.goto('/');
      await waitForPageStability(page);
      
      const primaryBtn = page.locator('button, a').filter({ hasText: /تسجيل|دخول|ابدأ/ }).first();
      if (await primaryBtn.isVisible()) {
        await expect(primaryBtn).toHaveScreenshot('component-btn-primary.png', {
          animations: 'disabled',
        });
      }
    });

    test('primary button hover @visual', async ({ page }) => {
      await page.goto('/');
      await waitForPageStability(page);
      
      const primaryBtn = page.locator('button, a').filter({ hasText: /تسجيل|دخول|ابدأ/ }).first();
      if (await primaryBtn.isVisible()) {
        await primaryBtn.hover();
        await expect(primaryBtn).toHaveScreenshot('component-btn-primary-hover.png', {
          animations: 'disabled',
        });
      }
    });
  });

  test.describe('Form Inputs', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await waitForPageStability(page);
    });

    test('text input states @visual', async ({ page }) => {
      const input = page.locator('input[type="email"], input[type="text"]').first();
      if (await input.isVisible()) {
        // Empty state
        await expect(input).toHaveScreenshot('component-input-empty.png', {
          animations: 'disabled',
        });
        
        // Filled state
        await input.fill('نص تجريبي');
        await expect(input).toHaveScreenshot('component-input-filled.png', {
          animations: 'disabled',
        });
        
        // Focused state
        await input.focus();
        await expect(input).toHaveScreenshot('component-input-focused.png', {
          animations: 'disabled',
        });
      }
    });

    test('password input with toggle @visual', async ({ page }) => {
      const passwordWrapper = page.locator('input[type="password"]').locator('..').first();
      if (await passwordWrapper.isVisible()) {
        await expect(passwordWrapper).toHaveScreenshot('component-password-input.png', {
          animations: 'disabled',
        });
      }
    });
  });

  test.describe('Tabs', () => {
    test('tabs default state @visual', async ({ page }) => {
      await page.goto('/login');
      await waitForPageStability(page);
      
      const tabs = page.locator('[role="tablist"]').first();
      if (await tabs.isVisible()) {
        await expect(tabs).toHaveScreenshot('component-tabs-default.png', {
          animations: 'disabled',
        });
      }
    });

    test('tabs active state @visual', async ({ page }) => {
      await page.goto('/login');
      await waitForPageStability(page);
      
      const tabs = page.locator('[role="tablist"]').first();
      const secondTab = page.locator('[role="tab"]').nth(1);
      
      if (await tabs.isVisible() && await secondTab.isVisible()) {
        await secondTab.click();
        await page.waitForTimeout(300);
        await expect(tabs).toHaveScreenshot('component-tabs-active-second.png', {
          animations: 'disabled',
        });
      }
    });
  });

  test.describe('Cards', () => {
    test('card component @visual', async ({ page }) => {
      await page.goto('/login');
      await waitForPageStability(page);
      
      const card = page.locator('[class*="card"], [class*="Card"]').first();
      if (await card.isVisible()) {
        await expect(card).toHaveScreenshot('component-card.png', {
          animations: 'disabled',
        });
      }
    });
  });

  test.describe('Loading States', () => {
    test('button loading state @visual', async ({ page }) => {
      await page.goto('/login');
      await waitForPageStability(page);
      
      // ملء النموذج وإرساله لرؤية حالة التحميل
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitBtn = page.locator('button[type="submit"]').first();
      
      if (await emailInput.isVisible() && await passwordInput.isVisible()) {
        await emailInput.fill('test@test.com');
        await passwordInput.fill('password123');
        await submitBtn.click();
        
        // محاولة التقاط حالة التحميل
        const loadingBtn = page.locator('button:has-text("جاري"), button:has([class*="animate"])');
        if (await loadingBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await expect(loadingBtn).toHaveScreenshot('component-btn-loading.png', {
            animations: 'allow',
          });
        }
      }
    });
  });
});
