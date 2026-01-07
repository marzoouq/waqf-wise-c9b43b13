/**
 * اختبارات Visual Regression
 * Visual Regression Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.describe('Landing Page Visual Tests', () => {
    test('landing page should match snapshot @visual', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Wait for any animations to complete
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('landing-page.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('landing page hero section @visual', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const hero = page.locator('section').first();
      if (await hero.isVisible()) {
        await expect(hero).toHaveScreenshot('hero-section.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Dashboard Visual Tests', () => {
    test('main dashboard layout @visual @dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('dashboard-main.png', {
        fullPage: false,
        animations: 'disabled'
      });
    });

    test('dashboard stats cards @visual @dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      const statsSection = page.locator('[class*="grid"]').first();
      if (await statsSection.isVisible()) {
        await expect(statsSection).toHaveScreenshot('dashboard-stats.png', {
          animations: 'disabled'
        });
      }
    });

    test('dashboard charts @visual @dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Wait for charts to render
      
      const chartContainer = page.locator('[class*="chart"], .recharts-wrapper').first();
      if (await chartContainer.isVisible()) {
        await expect(chartContainer).toHaveScreenshot('dashboard-chart.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Component Visual Tests', () => {
    test('buttons in different states @visual', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const button = page.locator('button').first();
      if (await button.isVisible()) {
        // Default state
        await expect(button).toHaveScreenshot('button-default.png');
        
        // Hover state
        await button.hover();
        await expect(button).toHaveScreenshot('button-hover.png');
      }
    });

    test('form inputs @visual', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      const input = page.locator('input').first();
      if (await input.isVisible()) {
        await expect(input).toHaveScreenshot('input-default.png');
        
        // Focus state
        await input.focus();
        await expect(input).toHaveScreenshot('input-focused.png');
      }
    });

    test('navigation menu @visual', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const nav = page.locator('nav, header').first();
      if (await nav.isVisible()) {
        await expect(nav).toHaveScreenshot('navigation.png', {
          animations: 'disabled'
        });
      }
    });

    test('sidebar navigation @visual', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      const sidebar = page.locator('[class*="sidebar"], aside').first();
      if (await sidebar.isVisible()) {
        await expect(sidebar).toHaveScreenshot('sidebar.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Table Visual Tests', () => {
    test('data table layout @visual', async ({ page }) => {
      await page.goto('/beneficiaries');
      await page.waitForLoadState('networkidle');
      
      const table = page.locator('table, [role="table"]').first();
      if (await table.isVisible()) {
        await expect(table).toHaveScreenshot('data-table.png', {
          animations: 'disabled'
        });
      }
    });

    test('table with pagination @visual', async ({ page }) => {
      await page.goto('/beneficiaries');
      await page.waitForLoadState('networkidle');
      
      const pagination = page.locator('[class*="pagination"]').first();
      if (await pagination.isVisible()) {
        await expect(pagination).toHaveScreenshot('pagination.png');
      }
    });
  });

  test.describe('Modal/Dialog Visual Tests', () => {
    test('modal dialog @visual', async ({ page }) => {
      await page.goto('/beneficiaries');
      await page.waitForLoadState('networkidle');
      
      // Try to open a modal by clicking add button
      const addButton = page.locator('button:has-text("إضافة"), button:has-text("جديد")').first();
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(300);
        
        const dialog = page.locator('[role="dialog"], [class*="modal"]').first();
        if (await dialog.isVisible()) {
          await expect(dialog).toHaveScreenshot('modal-dialog.png', {
            animations: 'disabled'
          });
        }
      }
    });
  });

  test.describe('Responsive Visual Tests', () => {
    test('mobile layout @visual @responsive', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('mobile-layout.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('tablet layout @visual @responsive', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('tablet-layout.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('desktop layout @visual @responsive', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('desktop-layout.png', {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Theme Visual Tests', () => {
    test('light theme @visual @theme', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Ensure light theme
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      });
      
      await expect(page).toHaveScreenshot('light-theme.png', {
        fullPage: false,
        animations: 'disabled'
      });
    });

    test('dark theme @visual @theme', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Switch to dark theme
      await page.evaluate(() => {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      });
      
      await page.waitForTimeout(300);
      
      await expect(page).toHaveScreenshot('dark-theme.png', {
        fullPage: false,
        animations: 'disabled'
      });
    });
  });

  test.describe('RTL Visual Tests', () => {
    test('RTL text alignment @visual', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Verify RTL direction
      const html = page.locator('html');
      const dir = await html.getAttribute('dir');
      
      expect(dir).toBe('rtl');
      
      await expect(page).toHaveScreenshot('rtl-layout.png', {
        fullPage: false,
        animations: 'disabled'
      });
    });

    test('RTL form alignment @visual', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      const form = page.locator('form').first();
      if (await form.isVisible()) {
        await expect(form).toHaveScreenshot('rtl-form.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Error State Visual Tests', () => {
    test('404 page @visual', async ({ page }) => {
      await page.goto('/non-existent-page-12345');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('404-page.png', {
        fullPage: false,
        animations: 'disabled'
      });
    });

    test('form validation errors @visual', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Submit empty form to trigger validation
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(300);
        
        const form = page.locator('form').first();
        await expect(form).toHaveScreenshot('form-errors.png', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Loading State Visual Tests', () => {
    test('loading skeleton @visual', async ({ page }) => {
      // Intercept API calls to slow them down
      await page.route('**/rest/v1/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });
      
      await page.goto('/beneficiaries');
      
      // Capture loading state quickly
      const skeleton = page.locator('[class*="skeleton"], [class*="loading"]').first();
      if (await skeleton.isVisible()) {
        await expect(skeleton).toHaveScreenshot('loading-skeleton.png');
      }
    });

    test('spinner loading @visual', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      const spinner = page.locator('[class*="spinner"], [class*="animate-spin"]').first();
      if (await spinner.isVisible()) {
        await expect(spinner).toHaveScreenshot('loading-spinner.png');
      }
    });
  });
});
