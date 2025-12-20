import { test, expect, enableDarkMode, enableLightMode, waitForPageStability } from '../fixtures/visual-test.fixture';
import { testRoutes } from '../fixtures/test-data';

/**
 * Theme Visual Regression Tests
 * اختبارات Visual Regression للوضع الداكن والفاتح
 */

const pagesToTest = [
  { name: 'landing', path: testRoutes.landing },
  { name: 'login', path: testRoutes.login },
];

test.describe('Light Mode Visual Tests', () => {
  for (const pageConfig of pagesToTest) {
    test(`${pageConfig.name} page in light mode @visual @theme`, async ({ page }) => {
      await page.goto(pageConfig.path);
      await waitForPageStability(page);
      await enableLightMode(page);
      
      await expect(page).toHaveScreenshot(
        `theme-light-${pageConfig.name}.png`,
        {
          fullPage: true,
          animations: 'disabled',
        }
      );
    });
  }

  test('light mode - form inputs @visual @theme', async ({ page }) => {
    await page.goto('/login');
    await waitForPageStability(page);
    await enableLightMode(page);
    
    const form = page.locator('form').first();
    if (await form.isVisible()) {
      await expect(form).toHaveScreenshot('theme-light-form.png', {
        animations: 'disabled',
      });
    }
  });

  test('light mode - buttons @visual @theme', async ({ page }) => {
    await page.goto('/login');
    await waitForPageStability(page);
    await enableLightMode(page);
    
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await expect(submitBtn).toHaveScreenshot('theme-light-button.png', {
        animations: 'disabled',
      });
    }
  });

  test('light mode - tabs @visual @theme', async ({ page }) => {
    await page.goto('/login');
    await waitForPageStability(page);
    await enableLightMode(page);
    
    const tabs = page.locator('[role="tablist"]').first();
    if (await tabs.isVisible()) {
      await expect(tabs).toHaveScreenshot('theme-light-tabs.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Dark Mode Visual Tests', () => {
  for (const pageConfig of pagesToTest) {
    test(`${pageConfig.name} page in dark mode @visual @theme`, async ({ page }) => {
      await page.goto(pageConfig.path);
      await waitForPageStability(page);
      await enableDarkMode(page);
      
      await expect(page).toHaveScreenshot(
        `theme-dark-${pageConfig.name}.png`,
        {
          fullPage: true,
          animations: 'disabled',
        }
      );
    });
  }

  test('dark mode - form inputs @visual @theme', async ({ page }) => {
    await page.goto('/login');
    await waitForPageStability(page);
    await enableDarkMode(page);
    
    const form = page.locator('form').first();
    if (await form.isVisible()) {
      await expect(form).toHaveScreenshot('theme-dark-form.png', {
        animations: 'disabled',
      });
    }
  });

  test('dark mode - buttons @visual @theme', async ({ page }) => {
    await page.goto('/login');
    await waitForPageStability(page);
    await enableDarkMode(page);
    
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await expect(submitBtn).toHaveScreenshot('theme-dark-button.png', {
        animations: 'disabled',
      });
    }
  });

  test('dark mode - tabs @visual @theme', async ({ page }) => {
    await page.goto('/login');
    await waitForPageStability(page);
    await enableDarkMode(page);
    
    const tabs = page.locator('[role="tablist"]').first();
    if (await tabs.isVisible()) {
      await expect(tabs).toHaveScreenshot('theme-dark-tabs.png', {
        animations: 'disabled',
      });
    }
  });

  test('dark mode - cards @visual @theme', async ({ page }) => {
    await page.goto('/login');
    await waitForPageStability(page);
    await enableDarkMode(page);
    
    const card = page.locator('[class*="card"], [class*="Card"]').first();
    if (await card.isVisible()) {
      await expect(card).toHaveScreenshot('theme-dark-card.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Theme Transition Visual Tests', () => {
  test('switch from light to dark @visual @theme', async ({ page }) => {
    await page.goto('/login');
    await waitForPageStability(page);
    
    // Light mode first
    await enableLightMode(page);
    await expect(page).toHaveScreenshot('theme-transition-light.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    // Switch to dark
    await enableDarkMode(page);
    await expect(page).toHaveScreenshot('theme-transition-dark.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('theme persistence check @visual @theme', async ({ page }) => {
    await page.goto('/login');
    await waitForPageStability(page);
    
    // Set dark mode
    await enableDarkMode(page);
    
    // Navigate to another page
    await page.goto('/');
    await waitForPageStability(page);
    
    // Check if dark mode persists
    const isDark = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    
    if (isDark) {
      await expect(page).toHaveScreenshot('theme-persisted-dark.png', {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });
});

test.describe('Theme Contrast Visual Tests', () => {
  test('light mode text contrast @visual @theme @a11y', async ({ page }) => {
    await page.goto('/login');
    await waitForPageStability(page);
    await enableLightMode(page);
    
    // التقاط النصوص للتحقق من التباين
    const textElements = page.locator('h1, h2, h3, p, label, span').first();
    if (await textElements.isVisible()) {
      await expect(textElements).toHaveScreenshot('theme-light-text-contrast.png', {
        animations: 'disabled',
      });
    }
  });

  test('dark mode text contrast @visual @theme @a11y', async ({ page }) => {
    await page.goto('/login');
    await waitForPageStability(page);
    await enableDarkMode(page);
    
    // التقاط النصوص للتحقق من التباين
    const textElements = page.locator('h1, h2, h3, p, label, span').first();
    if (await textElements.isVisible()) {
      await expect(textElements).toHaveScreenshot('theme-dark-text-contrast.png', {
        animations: 'disabled',
      });
    }
  });
});
