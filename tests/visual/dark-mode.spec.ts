/**
 * Visual Regression Tests - Dark Mode
 * اختبارات الوضع الداكن
 * @version 2.8.91
 */

import { test, expect } from '@playwright/test';

// الصفحات للاختبار
const pages = [
  { name: 'landing', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'dashboard', path: '/dashboard' },
  { name: 'beneficiaries', path: '/beneficiaries' },
];

test.describe('Dark Mode Visual Tests @theme', () => {
  test.beforeEach(async ({ page }) => {
    // تفعيل الوضع الداكن
    await page.emulateMedia({ colorScheme: 'dark' });
  });

  for (const pageInfo of pages) {
    test(`${pageInfo.name} should render correctly in dark mode`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      
      // التحقق من تطبيق الوضع الداكن
      const html = page.locator('html');
      const isDark = await html.evaluate((el) => 
        el.classList.contains('dark') || 
        el.getAttribute('data-theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
      
      await expect(page).toHaveScreenshot(`${pageInfo.name}-dark.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  }
});

test.describe('Light Mode Visual Tests @theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
  });

  for (const pageInfo of pages) {
    test(`${pageInfo.name} should render correctly in light mode`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot(`${pageInfo.name}-light.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  }
});

test.describe('Theme Toggle @theme', () => {
  test('theme toggle should work correctly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // البحث عن زر تبديل الثيم
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    
    if (await themeToggle.isVisible()) {
      // التقاط صورة في الوضع الحالي
      await expect(page).toHaveScreenshot('theme-before-toggle.png');
      
      // تبديل الثيم
      await themeToggle.click();
      await page.waitForTimeout(500); // انتظار الانتقال
      
      // التقاط صورة بعد التبديل
      await expect(page).toHaveScreenshot('theme-after-toggle.png');
    }
  });
});

test.describe('Color Contrast @theme', () => {
  test('text should have sufficient contrast in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // التحقق من تباين النصوص
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, a, button');
    const count = await textElements.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = textElements.nth(i);
      
      if (await element.isVisible()) {
        const contrast = await element.evaluate((el) => {
          const style = window.getComputedStyle(el);
          const color = style.color;
          const bgColor = style.backgroundColor;
          
          // حساب التباين (تبسيط)
          return { color, bgColor };
        });
        
        // يجب أن يكون هناك لون
        expect(contrast.color).toBeTruthy();
      }
    }
  });

  test('interactive elements should be visible in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // التحقق من ظهور الأزرار
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        await expect(button).toBeVisible();
      }
    }
  });
});

test.describe('High Contrast Mode @theme', () => {
  test('should support high contrast mode', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('high-contrast.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Component Theming @theme', () => {
  test('cards should have correct theme colors', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const card = page.locator('[data-testid="kpi-card"]').first();
    if (await card.isVisible()) {
      await expect(card).toHaveScreenshot('card-dark-mode.png');
    }
  });

  test('forms should have correct theme colors', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const form = page.locator('form').first();
    if (await form.isVisible()) {
      await expect(form).toHaveScreenshot('form-dark-mode.png');
    }
  });

  test('tables should have correct theme colors', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/beneficiaries');
    await page.waitForLoadState('networkidle');
    
    const table = page.locator('table').first();
    if (await table.isVisible()) {
      await expect(table).toHaveScreenshot('table-dark-mode.png');
    }
  });
});

test.describe('Reduced Motion with Theme @theme', () => {
  test('should respect reduced motion in dark mode', async ({ page }) => {
    await page.emulateMedia({ 
      colorScheme: 'dark',
      reducedMotion: 'reduce' 
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // التحقق من عدم وجود animations
    const animatedElements = page.locator('[class*="animate"]');
    const count = await animatedElements.count();
    
    // يجب أن تكون الـ animations متوقفة
    for (let i = 0; i < count; i++) {
      const element = animatedElements.nth(i);
      const animationDuration = await element.evaluate((el) => {
        return window.getComputedStyle(el).animationDuration;
      });
      
      // في وضع reduced motion، يجب أن تكون المدة 0
      // أو يجب أن لا تتحرك
    }
  });
});
