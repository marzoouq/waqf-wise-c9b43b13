import { test, expect, waitForPageStability } from '../fixtures/visual-test.fixture';
import { viewports, testRoutes } from '../fixtures/test-data';

/**
 * Responsive Visual Regression Tests
 * اختبارات Visual Regression للتجاوب مع مختلف أحجام الشاشات
 */

// الصفحات المراد اختبارها
const pagesToTest = [
  { name: 'landing', path: testRoutes.landing },
  { name: 'login', path: testRoutes.login },
];

// أحجام الشاشات المراد اختبارها
const viewportsToTest = [
  { name: 'mobile', ...viewports.mobile },
  { name: 'tablet', ...viewports.tablet },
  { name: 'desktop', ...viewports.desktop },
  { name: 'wide', ...viewports.wide },
];

test.describe('Responsive Visual Tests', () => {
  
  for (const viewport of viewportsToTest) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      for (const pageConfig of pagesToTest) {
        test(`${pageConfig.name} page @visual @responsive`, async ({ page }) => {
          await page.goto(pageConfig.path);
          await waitForPageStability(page);
          
          await expect(page).toHaveScreenshot(
            `responsive-${pageConfig.name}-${viewport.name}.png`,
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

test.describe('Mobile-specific Visual Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('mobile navigation menu @visual @responsive', async ({ page }) => {
    await page.goto('/');
    await waitForPageStability(page);
    
    // البحث عن زر القائمة الجانبية للموبايل
    const menuButton = page.locator('[aria-label*="menu"], [aria-label*="قائمة"], button:has([class*="menu"])').first();
    
    if (await menuButton.isVisible()) {
      await expect(menuButton).toHaveScreenshot('mobile-menu-button.png', {
        animations: 'disabled',
      });
      
      // فتح القائمة
      await menuButton.click();
      await page.waitForTimeout(500);
      
      // التقاط القائمة المفتوحة
      await expect(page).toHaveScreenshot('mobile-menu-open.png', {
        animations: 'disabled',
      });
    }
  });

  test('mobile form inputs @visual @responsive', async ({ page }) => {
    await page.goto('/login');
    await waitForPageStability(page);
    
    // التحقق من أن الحقول تعرض بشكل صحيح على الموبايل
    await expect(page).toHaveScreenshot('mobile-login-form.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('mobile touch targets @visual @responsive', async ({ page }) => {
    await page.goto('/login');
    await waitForPageStability(page);
    
    // التقاط الأزرار للتأكد من حجمها المناسب للمس
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await expect(submitBtn).toHaveScreenshot('mobile-touch-target.png', {
        animations: 'disabled',
      });
    }
  });
});

test.describe('Tablet-specific Visual Tests', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('tablet portrait layout @visual @responsive', async ({ page }) => {
    await page.goto('/');
    await waitForPageStability(page);
    
    await expect(page).toHaveScreenshot('tablet-portrait-landing.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Tablet Landscape Visual Tests', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test('tablet landscape layout @visual @responsive', async ({ page }) => {
    await page.goto('/');
    await waitForPageStability(page);
    
    await expect(page).toHaveScreenshot('tablet-landscape-landing.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Desktop Wide Visual Tests', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('wide screen layout @visual @responsive', async ({ page }) => {
    await page.goto('/');
    await waitForPageStability(page);
    
    await expect(page).toHaveScreenshot('wide-screen-landing.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('wide screen login @visual @responsive', async ({ page }) => {
    await page.goto('/login');
    await waitForPageStability(page);
    
    await expect(page).toHaveScreenshot('wide-screen-login.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
