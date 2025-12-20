import { test, expect, fullPageOptions, waitForPageStability } from '../fixtures/visual-test.fixture';

/**
 * Landing Page Visual Regression Tests
 * اختبارات Visual Regression لصفحة الهبوط
 */

test.describe('Landing Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageStability(page);
  });

  test('full page screenshot @visual', async ({ page }) => {
    await expect(page).toHaveScreenshot('landing-full-page.png', fullPageOptions);
  });

  test('hero section @visual', async ({ page }) => {
    const hero = page.locator('section').first();
    await expect(hero).toHaveScreenshot('landing-hero-section.png', {
      animations: 'disabled',
    });
  });

  test('header navigation @visual', async ({ page }) => {
    const header = page.locator('header').first();
    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('landing-header.png', {
        animations: 'disabled',
      });
    }
  });

  test('features section @visual', async ({ page }) => {
    // البحث عن قسم المميزات
    const featuresSection = page.locator('section').filter({ hasText: /مميزات|خدمات|ميزات/ }).first();
    if (await featuresSection.isVisible()) {
      await featuresSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await expect(featuresSection).toHaveScreenshot('landing-features.png', {
        animations: 'disabled',
      });
    }
  });

  test('footer section @visual', async ({ page }) => {
    const footer = page.locator('footer').first();
    if (await footer.isVisible()) {
      await footer.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await expect(footer).toHaveScreenshot('landing-footer.png', {
        animations: 'disabled',
      });
    }
  });

  test('CTA buttons @visual', async ({ page }) => {
    const ctaButton = page.locator('a[href="/login"], button').filter({ hasText: /تسجيل|دخول|ابدأ/ }).first();
    if (await ctaButton.isVisible()) {
      await expect(ctaButton).toHaveScreenshot('landing-cta-button.png', {
        animations: 'disabled',
      });
    }
  });

  test('above the fold content @visual', async ({ page }) => {
    // لقطة للمحتوى المرئي فوق الطي
    await expect(page).toHaveScreenshot('landing-above-fold.png', {
      animations: 'disabled',
      fullPage: false,
    });
  });
});
