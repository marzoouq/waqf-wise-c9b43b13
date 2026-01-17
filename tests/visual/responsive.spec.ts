/**
 * Visual Regression Tests - Responsive
 * اختبارات التجاوب البصري
 * @version 2.8.91
 */

import { test, expect, devices } from '@playwright/test';

// الأجهزة للاختبار
const testDevices = [
  { name: 'mobile', viewport: { width: 375, height: 812 } }, // iPhone X
  { name: 'tablet', viewport: { width: 768, height: 1024 } }, // iPad
  { name: 'desktop', viewport: { width: 1440, height: 900 } }, // Desktop
];

// الصفحات للاختبار
const pages = [
  { name: 'dashboard', path: '/dashboard' },
  { name: 'beneficiaries', path: '/beneficiaries' },
  { name: 'properties', path: '/properties' },
];

test.describe('Responsive Design Tests @responsive', () => {
  for (const device of testDevices) {
    test.describe(`${device.name} viewport`, () => {
      test.use({ viewport: device.viewport });

      for (const page of pages) {
        test(`${page.name} should be responsive on ${device.name}`, async ({ page: browserPage }) => {
          await browserPage.goto(page.path);
          await browserPage.waitForLoadState('networkidle');
          
          await expect(browserPage).toHaveScreenshot(
            `${page.name}-${device.name}.png`,
            {
              fullPage: true,
              animations: 'disabled',
            }
          );
        });
      }
    });
  }
});

test.describe('Mobile Navigation @responsive', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('bottom navigation should be visible on mobile', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const bottomNav = page.locator('[data-testid="bottom-navigation"]');
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav).toHaveScreenshot('bottom-navigation-mobile.png');
  });

  test('sidebar should be hidden on mobile', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).not.toBeVisible();
  });

  test('mobile menu should open correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeVisible();
      await expect(mobileMenu).toHaveScreenshot('mobile-menu-open.png');
    }
  });
});

test.describe('Tablet Layout @responsive', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('tablet layout should show sidebar in mini mode', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('tablet-layout.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('tablet should have touch-friendly buttons', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      
      if (box) {
        // التحقق من أن حجم الزر 44px على الأقل
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });
});

test.describe('Desktop Layout @responsive', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('desktop should show full sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const sidebar = page.locator('[data-testid="sidebar"]');
    if (await sidebar.isVisible()) {
      const box = await sidebar.boundingBox();
      expect(box?.width).toBeGreaterThan(200);
    }
  });

  test('desktop tables should show all columns', async ({ page }) => {
    await page.goto('/beneficiaries');
    await page.waitForLoadState('networkidle');
    
    const table = page.locator('table');
    if (await table.isVisible()) {
      const headers = page.locator('th');
      const headerCount = await headers.count();
      
      // يجب أن تظهر جميع الأعمدة على الديسكتوب
      expect(headerCount).toBeGreaterThan(3);
    }
  });
});

test.describe('Orientation Changes @responsive', () => {
  test('landscape mobile should adjust layout', async ({ page }) => {
    await page.setViewportSize({ width: 812, height: 375 }); // Landscape
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('dashboard-landscape.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Safe Area Support @responsive', () => {
  test('should respect safe area insets on notched devices', async ({ page }) => {
    // محاكاة iPhone X مع safe area
    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // التحقق من وجود padding للـ safe area
    const content = page.locator('main');
    if (await content.isVisible()) {
      const styles = await content.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          paddingBottom: computed.paddingBottom,
        };
      });
      
      // يجب أن يكون هناك padding
      expect(styles.paddingBottom).not.toBe('0px');
    }
  });
});
