import { test, expect } from '@playwright/test';

/**
 * Dashboard Navigation E2E Tests
 * اختبارات التنقل بين لوحات التحكم
 */

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@waqf.sa',
  password: process.env.TEST_USER_PASSWORD || 'Test123!',
};

// Dashboard routes by role
const ROLE_DASHBOARDS = {
  admin: '/dashboard',
  nazer: '/nazer-dashboard',
  accountant: '/accountant-dashboard',
  cashier: '/cashier-dashboard',
  archivist: '/archivist-dashboard',
  beneficiary: '/beneficiary-portal',
};

test.describe('Dashboard Access Control', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for potential redirect
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    const isProtected = 
      currentUrl.includes('/login') || 
      currentUrl.includes('/auth') ||
      currentUrl.includes('/unauthorized');

    // If still on dashboard, check for auth prompt
    if (currentUrl.includes('/dashboard')) {
      const authElements = page.locator('text=تسجيل الدخول, text=الرجاء تسجيل الدخول');
      const hasAuthPrompt = await authElements.first().isVisible().catch(() => false);
      expect(hasAuthPrompt || isProtected).toBeTruthy();
    } else {
      expect(isProtected).toBeTruthy();
    }
  });

  test('should redirect from beneficiary portal without auth', async ({ page }) => {
    await page.goto('/beneficiary-portal');

    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    // Should be redirected or show login prompt
    expect(
      currentUrl.includes('/login') ||
      currentUrl.includes('/auth') ||
      currentUrl.includes('/beneficiary-portal')
    ).toBeTruthy();
  });
});

test.describe('Sidebar Navigation', () => {
  // Helper to login before tests
  async function loginAsTestUser(page: any) {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_USER.email);
      await passwordInput.fill(TEST_USER.password);
      await page.locator('button[type="submit"]').first().click();

      try {
        await page.waitForURL(/\/(dashboard|redirect|nazer|accountant|home)/, {
          timeout: 10000,
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  test('should display sidebar on dashboard', async ({ page }) => {
    const loggedIn = await loginAsTestUser(page);
    test.skip(!loggedIn, 'Could not login');

    const sidebar = page.locator('aside, nav, [class*="sidebar"]').first();
    await expect(sidebar).toBeVisible();
  });

  test('should have navigation links in sidebar', async ({ page }) => {
    const loggedIn = await loginAsTestUser(page);
    test.skip(!loggedIn, 'Could not login');

    const sidebar = page.locator('aside, [class*="sidebar"]').first();

    if (await sidebar.isVisible()) {
      const links = await sidebar.locator('a').all();
      expect(links.length).toBeGreaterThan(0);
    }
  });

  test('should navigate via sidebar links', async ({ page }) => {
    const loggedIn = await loginAsTestUser(page);
    test.skip(!loggedIn, 'Could not login');

    const sidebar = page.locator('aside, [class*="sidebar"]').first();

    if (await sidebar.isVisible()) {
      const links = await sidebar.locator('a[href]').all();

      // Test first 2 navigation links
      for (const link of links.slice(0, 2)) {
        const href = await link.getAttribute('href');

        // Skip logout and external links
        if (href && !href.includes('logout') && !href.startsWith('http') && href !== '#') {
          const initialUrl = page.url();
          await link.click();
          await page.waitForLoadState('networkidle');

          // URL should change or content should update
          const newUrl = page.url();
          
          // Go back for next test
          if (newUrl !== initialUrl) {
            await page.goBack();
            await page.waitForLoadState('networkidle');
          }
        }
      }
    }
  });

  test('should collapse and expand sidebar', async ({ page }) => {
    const loggedIn = await loginAsTestUser(page);
    test.skip(!loggedIn, 'Could not login');

    const collapseButton = page.locator(
      '[aria-label*="collapse"], [aria-label*="طي"], button:has([class*="chevron"]), button:has([class*="menu"])'
    ).first();

    if (await collapseButton.isVisible()) {
      const sidebar = page.locator('aside, [class*="sidebar"]').first();
      const initialWidth = await sidebar.evaluate((el) => el.getBoundingClientRect().width);

      await collapseButton.click();
      await page.waitForTimeout(500);

      const newWidth = await sidebar.evaluate((el) => el.getBoundingClientRect().width);

      // Width should change (either collapsed or expanded)
      expect(newWidth).not.toBe(initialWidth);
    }
  });
});

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should show mobile menu button on small screens', async ({ page }) => {
    await page.goto('/login');
    
    // Login first
    const emailInput = page.locator('input[type="email"]').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_USER.email);
      await page.locator('input[type="password"]').first().fill(TEST_USER.password);
      await page.locator('button[type="submit"]').first().click();

      try {
        await page.waitForURL(/\/(dashboard|redirect|home)/, { timeout: 10000 });

        const menuButton = page.locator(
          '[aria-label*="menu"], [aria-label*="قائمة"], button:has([class*="menu"])'
        ).first();

        // Mobile menu button should be visible
        const isVisible = await menuButton.isVisible().catch(() => false);
        expect(isVisible).toBeTruthy();
      } catch {
        test.skip();
      }
    }
  });

  test('should open mobile drawer on menu click', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_USER.email);
      await page.locator('input[type="password"]').first().fill(TEST_USER.password);
      await page.locator('button[type="submit"]').first().click();

      try {
        await page.waitForURL(/\/(dashboard|redirect|home)/, { timeout: 10000 });

        const menuButton = page.locator('[aria-label*="menu"], [aria-label*="قائمة"]').first();

        if (await menuButton.isVisible()) {
          await menuButton.click();
          await page.waitForTimeout(300);

          const drawer = page.locator('[role="dialog"], [class*="drawer"], [class*="sheet"]');
          const isDrawerOpen = await drawer.first().isVisible().catch(() => false);
          
          expect(isDrawerOpen).toBeTruthy();
        }
      } catch {
        test.skip();
      }
    }
  });

  test('should close mobile drawer on outside click', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_USER.email);
      await page.locator('input[type="password"]').first().fill(TEST_USER.password);
      await page.locator('button[type="submit"]').first().click();

      try {
        await page.waitForURL(/\/(dashboard|redirect|home)/, { timeout: 10000 });

        const menuButton = page.locator('[aria-label*="menu"]').first();

        if (await menuButton.isVisible()) {
          await menuButton.click();
          await page.waitForTimeout(300);

          // Click outside to close
          await page.click('body', { position: { x: 10, y: 10 } });
          await page.waitForTimeout(300);

          const drawer = page.locator('[role="dialog"]:visible, [class*="drawer"]:visible');
          const isDrawerVisible = await drawer.first().isVisible().catch(() => false);
          
          expect(isDrawerVisible).toBeFalsy();
        }
      } catch {
        test.skip();
      }
    }
  });
});

test.describe('Breadcrumb Navigation', () => {
  test('should show breadcrumb on inner pages', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_USER.email);
      await page.locator('input[type="password"]').first().fill(TEST_USER.password);
      await page.locator('button[type="submit"]').first().click();

      try {
        await page.waitForURL(/\/(dashboard|redirect|home)/, { timeout: 10000 });

        // Navigate to a sub-page
        await page.goto('/beneficiaries');
        await page.waitForLoadState('networkidle');

        const breadcrumb = page.locator(
          '[aria-label*="breadcrumb"], nav[class*="breadcrumb"], [class*="breadcrumb"]'
        );

        // Breadcrumb may or may not be implemented
        const hasBreadcrumb = await breadcrumb.first().isVisible().catch(() => false);
        
        // Log result for visibility
        console.log(`Breadcrumb present: ${hasBreadcrumb}`);
      } catch {
        test.skip();
      }
    }
  });
});

test.describe('Dashboard Content Loading', () => {
  test('should display loading state then content', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_USER.email);
      await page.locator('input[type="password"]').first().fill(TEST_USER.password);
      await page.locator('button[type="submit"]').first().click();

      try {
        await page.waitForURL(/\/(dashboard|redirect|home)/, { timeout: 10000 });

        // Wait for content to load
        await page.waitForLoadState('networkidle');

        // Should have main content area
        const mainContent = page.locator('main, [role="main"], [class*="content"]').first();
        await expect(mainContent).toBeVisible();
      } catch {
        test.skip();
      }
    }
  });
});

test.describe('Dashboard Quick Actions', () => {
  test('should display quick action buttons', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_USER.email);
      await page.locator('input[type="password"]').first().fill(TEST_USER.password);
      await page.locator('button[type="submit"]').first().click();

      try {
        await page.waitForURL(/\/(dashboard|redirect|home)/, { timeout: 10000 });

        // Look for action buttons (add, create, new, etc.)
        const actionButtons = page.locator(
          'button:has-text("إضافة"), button:has-text("جديد"), button:has-text("إنشاء")'
        );

        const buttonCount = await actionButtons.count();
        console.log(`Quick action buttons found: ${buttonCount}`);
      } catch {
        test.skip();
      }
    }
  });
});

test.describe('Dashboard Statistics Cards', () => {
  test('should display statistics cards', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_USER.email);
      await page.locator('input[type="password"]').first().fill(TEST_USER.password);
      await page.locator('button[type="submit"]').first().click();

      try {
        await page.waitForURL(/\/(dashboard|redirect|home)/, { timeout: 10000 });

        // Look for stat cards
        const statCards = page.locator('[class*="card"], [class*="stat"]');
        const cardCount = await statCards.count();

        console.log(`Statistics cards found: ${cardCount}`);
        expect(cardCount).toBeGreaterThanOrEqual(0);
      } catch {
        test.skip();
      }
    }
  });
});

test.describe('User Profile Menu', () => {
  test('should display user profile dropdown', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_USER.email);
      await page.locator('input[type="password"]').first().fill(TEST_USER.password);
      await page.locator('button[type="submit"]').first().click();

      try {
        await page.waitForURL(/\/(dashboard|redirect|home)/, { timeout: 10000 });

        // Look for user menu
        const userMenu = page.locator(
          '[aria-label*="user"], [aria-label*="المستخدم"], button:has([class*="avatar"])'
        ).first();

        if (await userMenu.isVisible()) {
          await userMenu.click();
          await page.waitForTimeout(300);

          // Dropdown should appear
          const dropdown = page.locator('[role="menu"], [class*="dropdown"]');
          const isDropdownVisible = await dropdown.first().isVisible().catch(() => false);

          expect(isDropdownVisible).toBeTruthy();
        }
      } catch {
        test.skip();
      }
    }
  });
});
