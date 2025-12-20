import { test, expect, fullPageOptions, waitForPageStability, maskedOptions } from '../fixtures/visual-test.fixture';
import { dynamicSelectors } from '../fixtures/test-data';

/**
 * Login Page Visual Regression Tests
 * اختبارات Visual Regression لصفحة تسجيل الدخول
 */

test.describe('Login Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await waitForPageStability(page);
  });

  test('full page screenshot @visual', async ({ page }) => {
    await expect(page).toHaveScreenshot('login-full-page.png', fullPageOptions);
  });

  test('login card component @visual', async ({ page }) => {
    // البحث عن بطاقة تسجيل الدخول
    const loginCard = page.locator('[class*="card"], [class*="Card"], form').first();
    if (await loginCard.isVisible()) {
      await expect(loginCard).toHaveScreenshot('login-card.png', {
        animations: 'disabled',
      });
    }
  });

  test('staff login tab @visual', async ({ page }) => {
    // النقر على تبويب الموظفين
    const staffTab = page.locator('[role="tab"]').filter({ hasText: /موظف|staff|الموظفون/ }).first();
    if (await staffTab.isVisible()) {
      await staffTab.click();
      await page.waitForTimeout(300);
      await expect(page.locator('form').first()).toHaveScreenshot('login-staff-tab.png', {
        animations: 'disabled',
      });
    }
  });

  test('beneficiary login tab @visual', async ({ page }) => {
    // النقر على تبويب المستفيدين
    const beneficiaryTab = page.locator('[role="tab"]').filter({ hasText: /مستفيد|beneficiary|المستفيدون/ }).first();
    if (await beneficiaryTab.isVisible()) {
      await beneficiaryTab.click();
      await page.waitForTimeout(300);
      await expect(page.locator('form').first()).toHaveScreenshot('login-beneficiary-tab.png', {
        animations: 'disabled',
      });
    }
  });

  test('tabs component @visual', async ({ page }) => {
    const tabsList = page.locator('[role="tablist"]').first();
    if (await tabsList.isVisible()) {
      await expect(tabsList).toHaveScreenshot('login-tabs.png', {
        animations: 'disabled',
      });
    }
  });

  test('email input empty state @visual', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"], #staff-email, #email').first();
    if (await emailInput.isVisible()) {
      await expect(emailInput).toHaveScreenshot('login-email-empty.png', {
        animations: 'disabled',
      });
    }
  });

  test('email input filled state @visual', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"], #staff-email, #email').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveScreenshot('login-email-filled.png', {
        animations: 'disabled',
      });
    }
  });

  test('email input focused state @visual', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"], #staff-email, #email').first();
    if (await emailInput.isVisible()) {
      await emailInput.focus();
      await expect(emailInput).toHaveScreenshot('login-email-focused.png', {
        animations: 'disabled',
      });
    }
  });

  test('password input @visual', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]').first();
    if (await passwordInput.isVisible()) {
      await expect(passwordInput).toHaveScreenshot('login-password-input.png', {
        animations: 'disabled',
      });
    }
  });

  test('submit button @visual', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await expect(submitBtn).toHaveScreenshot('login-submit-button.png', {
        animations: 'disabled',
      });
    }
  });

  test('submit button hover state @visual', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.hover();
      await expect(submitBtn).toHaveScreenshot('login-submit-button-hover.png', {
        animations: 'disabled',
      });
    }
  });

  test('form with masked dynamic elements @visual', async ({ page }) => {
    await expect(page).toHaveScreenshot('login-masked.png', {
      ...maskedOptions(page, dynamicSelectors),
      fullPage: true,
    });
  });
});
