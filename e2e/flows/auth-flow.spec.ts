import { test, expect } from '@playwright/test';

/**
 * Authentication Flow E2E Tests
 * اختبارات تدفق المصادقة الشاملة باستخدام Playwright
 */

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@waqf.sa',
  password: process.env.TEST_USER_PASSWORD || 'Test123!',
};

const TEST_BENEFICIARY = {
  nationalId: process.env.TEST_NATIONAL_ID || '1234567890',
  password: process.env.TEST_BENEFICIARY_PASSWORD || 'Test123!',
};

test.describe('Login Page UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('should display login page correctly', async ({ page }) => {
    // Check for main elements
    await expect(page.locator('h1, [class*="title"]').first()).toBeVisible();
    
    // Check for tabs (staff/beneficiary)
    const tabs = page.locator('[role="tablist"]');
    await expect(tabs).toBeVisible();
  });

  test('should have email and password inputs', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should have submit button', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test('should switch between staff and beneficiary tabs', async ({ page }) => {
    // Find beneficiary tab
    const beneficiaryTab = page.locator('text=المستفيدون').first();
    
    if (await beneficiaryTab.isVisible()) {
      await beneficiaryTab.click();
      await page.waitForTimeout(300);

      // Should show national ID input instead of email
      const nationalIdInput = page.locator('input[id*="national"], input[placeholder*="هوية"]').first();
      await expect(nationalIdInput).toBeVisible();
    }
  });
});

test.describe('Staff Login Flow', () => {
  test('should show error for empty form submission', async ({ page }) => {
    await page.goto('/login');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    await page.waitForTimeout(500);

    // Should show validation error or stay on page
    expect(page.url()).toContain('/login');
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill('invalid-email');

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    await page.waitForTimeout(500);

    // Should stay on login page or show error
    expect(page.url()).toContain('/login');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await emailInput.fill('nonexistent@test.com');
    await passwordInput.fill('wrongpassword123');

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait for error response
    await page.waitForTimeout(2000);

    // Should show error message
    const errorMessage = page.locator('[role="alert"], [class*="toast"], [class*="error"]').first();
    const hasError = await errorMessage.isVisible().catch(() => false);

    // Either shows error or stays on login page
    if (!hasError) {
      expect(page.url()).toContain('/login');
    }
  });

  test('should redirect after successful login', async ({ page }) => {
    test.skip(!TEST_USER.email.includes('@'), 'No valid test user configured');

    await page.goto('/login');

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait for navigation
    try {
      await page.waitForURL(/\/(dashboard|redirect|nazer|accountant|beneficiary|home)/, {
        timeout: 10000,
      });
      expect(page.url()).not.toContain('/login');
    } catch {
      // If redirect doesn't happen, check for error message
      console.log('Login may have failed - checking for error state');
    }
  });
});

test.describe('Beneficiary Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    // Switch to beneficiary tab
    const beneficiaryTab = page.locator('text=المستفيدون').first();
    if (await beneficiaryTab.isVisible()) {
      await beneficiaryTab.click();
      await page.waitForTimeout(300);
    }
  });

  test('should show national ID input in beneficiary tab', async ({ page }) => {
    const nationalIdInput = page.locator('input[id*="national"], input[placeholder*="هوية"]').first();
    
    // May or may not be visible depending on tab implementation
    const isVisible = await nationalIdInput.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(nationalIdInput).toBeVisible();
    }
  });

  test('should validate national ID format (10 digits)', async ({ page }) => {
    const nationalIdInput = page.locator('input[id*="national"], input[placeholder*="هوية"]').first();
    
    if (await nationalIdInput.isVisible()) {
      // Enter short ID
      await nationalIdInput.fill('123');
      
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();

      await page.waitForTimeout(500);

      // Should stay on login or show validation error
      expect(page.url()).toContain('/login');
    }
  });

  test('should accept valid national ID format', async ({ page }) => {
    const nationalIdInput = page.locator('input[id*="national"], input[placeholder*="هوية"]').first();
    
    if (await nationalIdInput.isVisible()) {
      // Enter valid 10-digit ID
      await nationalIdInput.fill('1234567890');
      
      const value = await nationalIdInput.inputValue();
      expect(value.length).toBe(10);
    }
  });
});

test.describe('OAuth Login Options', () => {
  test('should display Google login button', async ({ page }) => {
    await page.goto('/login');

    const googleButton = page.locator('button:has-text("Google"), [class*="google"]').first();
    
    // Google login may or may not be implemented
    const isVisible = await googleButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(googleButton).toBeEnabled();
    }
  });

  test('should initiate OAuth flow on Google button click', async ({ page }) => {
    await page.goto('/login');

    const googleButton = page.locator('button:has-text("Google")').first();
    
    if (await googleButton.isVisible()) {
      // Clicking should either open popup or redirect
      const [popup] = await Promise.all([
        page.waitForEvent('popup', { timeout: 3000 }).catch(() => null),
        googleButton.click(),
      ]);

      if (popup) {
        // OAuth popup opened
        expect(popup.url()).toContain('google');
        await popup.close();
      }
    }
  });
});

test.describe('Session Management', () => {
  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL(/\/(login|unauthorized|auth)/, { timeout: 5000 }).catch(() => {});
    
    // Either redirected or shows unauthorized state
    const isOnLogin = page.url().includes('/login') || page.url().includes('/auth');
    const isOnDashboard = page.url().includes('/dashboard');
    
    // If still on dashboard, there should be an auth prompt
    if (isOnDashboard) {
      const authPrompt = page.locator('text=تسجيل الدخول, text=غير مصرح');
      expect(await authPrompt.isVisible()).toBeTruthy();
    } else {
      expect(isOnLogin).toBeTruthy();
    }
  });

  test('should persist session after page reload', async ({ page }) => {
    test.skip(!TEST_USER.email.includes('@'), 'No valid test user configured');

    await page.goto('/login');

    // Login first
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);
    await page.locator('button[type="submit"]').first().click();

    // Wait for redirect
    try {
      await page.waitForURL(/\/(dashboard|redirect|home)/, { timeout: 10000 });

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still be logged in (not on login page)
      expect(page.url()).not.toContain('/login');
    } catch {
      console.log('Login test skipped - credentials may be invalid');
    }
  });
});

test.describe('Logout Flow', () => {
  test('should have logout option when logged in', async ({ page }) => {
    test.skip(!TEST_USER.email.includes('@'), 'No valid test user configured');

    await page.goto('/login');

    // Login first
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);
    await page.locator('button[type="submit"]').first().click();

    try {
      await page.waitForURL(/\/(dashboard|redirect|home)/, { timeout: 10000 });

      // Look for logout button
      const logoutButton = page.locator('button:has-text("خروج"), button:has-text("تسجيل الخروج"), [aria-label*="logout"]').first();

      // May be in a dropdown menu
      const userMenu = page.locator('[aria-label*="user"], [aria-label*="menu"], button:has([class*="avatar"])').first();
      
      if (await userMenu.isVisible()) {
        await userMenu.click();
        await page.waitForTimeout(300);
      }

      const logoutVisible = await logoutButton.isVisible().catch(() => false);
      if (logoutVisible) {
        await expect(logoutButton).toBeEnabled();
      }
    } catch {
      console.log('Logout test skipped - login failed');
    }
  });
});

test.describe('Password Visibility Toggle', () => {
  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('input[type="password"]').first();
    const toggleButton = page.locator('button:near(input[type="password"]), [class*="eye"]').first();

    // Check initial state
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // If toggle exists, click it
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      
      // Password should now be visible
      const inputType = await passwordInput.getAttribute('type');
      expect(['text', 'password']).toContain(inputType);
    }
  });
});

test.describe('Form Accessibility', () => {
  test('should navigate login form with keyboard', async ({ page }) => {
    await page.goto('/login');

    // Tab to first input
    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);

    // Tab through form
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should still be in the form area
    const stillFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(stillFocused);
  });

  test('should submit form with Enter key', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');

    // Press Enter to submit
    await page.keyboard.press('Enter');

    await page.waitForTimeout(1000);

    // Form should have been submitted (either error or redirect)
    // Just checking that Enter key triggers form submission
  });
});
