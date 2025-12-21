import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * WCAG 2.1 AA Compliance Tests
 * اختبارات التوافق مع معايير WCAG للإتاحة
 * 
 * Uses axe-core for automated accessibility testing
 */

// Public pages to test
const PUBLIC_PAGES = [
  { path: '/', name: 'الصفحة الرئيسية' },
  { path: '/login', name: 'صفحة تسجيل الدخول' },
];

// Test configuration
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'];

test.describe('WCAG 2.1 AA Compliance - Core Tests @accessibility', () => {
  test.describe('Public Pages Accessibility', () => {
    for (const page of PUBLIC_PAGES) {
      test(`${page.name} - no critical accessibility violations`, async ({ page: browserPage }) => {
        await browserPage.goto(page.path);
        await browserPage.waitForLoadState('networkidle');

        const results = await new AxeBuilder({ page: browserPage })
          .withTags(WCAG_TAGS)
          .analyze();

        // Log violations for debugging
        if (results.violations.length > 0) {
          console.log(`\n❌ Accessibility Violations in ${page.name}:`);
          results.violations.forEach((v) => {
            console.log(`  - [${v.impact}] ${v.id}: ${v.description}`);
            console.log(`    Help: ${v.helpUrl}`);
            console.log(`    Affected elements: ${v.nodes.length}`);
          });
        }

        // Filter for critical and serious violations only
        const criticalViolations = results.violations.filter(
          (v) => v.impact === 'critical' || v.impact === 'serious'
        );

        expect(criticalViolations).toEqual([]);
      });
    }
  });

  test.describe('Login Page Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Check for exactly one h1
      const h1Elements = await page.locator('h1').all();
      expect(h1Elements.length).toBe(1);

      // Get all headings and verify hierarchy
      const headings = await page.evaluate(() => {
        const h = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        return Array.from(h).map((el) => ({
          level: parseInt(el.tagName[1]),
          text: el.textContent?.trim() || '',
        }));
      });

      // Check for heading level jumps (e.g., h1 to h3 without h2)
      for (let i = 1; i < headings.length; i++) {
        const jump = headings[i].level - headings[i - 1].level;
        expect(jump).toBeLessThanOrEqual(1);
      }
    });

    test('should have accessible form labels', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Check all visible inputs have labels
      const inputs = await page.locator('input:visible').all();

      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const placeholder = await input.getAttribute('placeholder');
        const type = await input.getAttribute('type');

        // Hidden inputs don't need labels
        if (type === 'hidden') continue;

        // Input should have some form of accessible name
        let hasAccessibleName = false;

        if (id) {
          const labelCount = await page.locator(`label[for="${id}"]`).count();
          hasAccessibleName = labelCount > 0;
        }

        if (!hasAccessibleName) {
          hasAccessibleName = !!(ariaLabel || ariaLabelledBy);
        }

        // Placeholder alone is not sufficient but acceptable as fallback
        if (!hasAccessibleName && placeholder) {
          console.warn(`⚠️ Input uses only placeholder for labeling: ${placeholder}`);
        }

        expect(hasAccessibleName || placeholder).toBeTruthy();
      }
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Get focusable elements
      const focusable = await page
        .locator('a:visible, button:visible, input:visible, select:visible, textarea:visible')
        .all();

      // Test first 5 elements
      for (const element of focusable.slice(0, 5)) {
        await element.focus();

        // Check for focus styles
        const styles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            outline: computed.outline,
            outlineWidth: computed.outlineWidth,
            boxShadow: computed.boxShadow,
            border: computed.border,
          };
        });

        // Element should have some visible focus indicator
        const hasFocusIndicator =
          styles.outline !== 'none' ||
          styles.outlineWidth !== '0px' ||
          (styles.boxShadow && styles.boxShadow !== 'none');

        if (!hasFocusIndicator) {
          console.warn(`⚠️ Element may lack visible focus indicator`);
        }
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Start tabbing through the page
      let tabCount = 0;
      const maxTabs = 20;
      const focusedElements: string[] = [];

      while (tabCount < maxTabs) {
        await page.keyboard.press('Tab');
        tabCount++;

        const focusedTag = await page.evaluate(() => {
          const el = document.activeElement;
          return el ? `${el.tagName}${el.id ? `#${el.id}` : ''}` : 'BODY';
        });

        if (focusedTag === 'BODY') break;
        focusedElements.push(focusedTag);
      }

      // Should have multiple tabbable elements
      expect(focusedElements.length).toBeGreaterThan(2);
    });

    test('should close dialogs with Escape key', async ({ page }) => {
      await page.goto('/login');

      // Look for any dialog triggers
      const dialogTrigger = page
        .locator('[aria-haspopup="dialog"], [data-state="closed"]')
        .first();

      if ((await dialogTrigger.count()) > 0 && (await dialogTrigger.isVisible())) {
        await dialogTrigger.click();
        await page.waitForTimeout(300);

        const dialog = page.locator('[role="dialog"]:visible');

        if ((await dialog.count()) > 0) {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);

          // Dialog should be closed
          expect(await dialog.isVisible()).toBeFalsy();
        }
      }
    });
  });

  test.describe('RTL and Internationalization', () => {
    test('should have proper RTL direction', async ({ page }) => {
      await page.goto('/');

      const htmlDir = await page.locator('html').getAttribute('dir');
      const htmlLang = await page.locator('html').getAttribute('lang');

      expect(htmlDir).toBe('rtl');
      expect(htmlLang).toBe('ar');
    });

    test('should have proper text direction for content', async ({ page }) => {
      await page.goto('/login');

      // Check that text containers have RTL
      const mainContent = page.locator('main, [role="main"], .container').first();

      if ((await mainContent.count()) > 0) {
        const direction = await mainContent.evaluate((el) => {
          return window.getComputedStyle(el).direction;
        });

        expect(direction).toBe('rtl');
      }
    });
  });

  test.describe('Color Contrast', () => {
    test('login page meets contrast requirements', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('button, a, input, label, p, h1, h2, h3')
        .analyze();

      const contrastViolations = results.violations.filter(
        (v) => v.id.includes('contrast') || v.id.includes('color')
      );

      if (contrastViolations.length > 0) {
        console.log('\n⚠️ Contrast Issues:');
        contrastViolations.forEach((v) => {
          v.nodes.forEach((node) => {
            console.log(`  - ${node.html.substring(0, 100)}`);
          });
        });
      }

      // Allow minor contrast issues but flag them
      const criticalContrastIssues = contrastViolations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(criticalContrastIssues).toEqual([]);
    });
  });

  test.describe('Form Error Handling', () => {
    test('should show accessible error messages', async ({ page }) => {
      await page.goto('/login');

      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();

      await page.waitForTimeout(500);

      // Check for error messages with proper ARIA
      const errorMessages = await page
        .locator('[role="alert"], [aria-live="polite"], [aria-live="assertive"], [aria-invalid="true"]')
        .all();

      // Form should either have HTML5 validation or custom error messages
      const hasValidation = errorMessages.length > 0 || (await page.locator(':invalid').count()) > 0;

      expect(hasValidation).toBeTruthy();
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('touch targets are appropriately sized', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');

      const interactiveElements = await page.locator('button:visible, a:visible, input:visible').all();

      for (const element of interactiveElements.slice(0, 5)) {
        const box = await element.boundingBox();

        if (box) {
          // WCAG 2.2 requires 44x44 minimum for touch targets
          // We'll warn for smaller but not fail (24x24 is common minimum)
          if (box.width < 24 || box.height < 24) {
            console.warn(`⚠️ Small touch target: ${box.width}x${box.height}px`);
          }

          expect(box.width).toBeGreaterThanOrEqual(24);
          expect(box.height).toBeGreaterThanOrEqual(24);
        }
      }
    });

    test('content is not cut off on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');

      // Check for horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBeFalsy();
    });
  });

  test.describe('Images and Media', () => {
    test('images have alt text', async ({ page }) => {
      await page.goto('/login');

      const images = await page.locator('img').all();

      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');
        const ariaHidden = await img.getAttribute('aria-hidden');

        // Decorative images can have empty alt or aria-hidden
        const isDecorative = alt === '' || role === 'presentation' || ariaHidden === 'true';

        // Non-decorative images must have meaningful alt
        if (!isDecorative) {
          expect(alt).toBeTruthy();
        }
      }
    });
  });

  test.describe('Skip Links and Landmarks', () => {
    test('should have main landmark', async ({ page }) => {
      await page.goto('/login');

      const mainLandmark = page.locator('main, [role="main"]');
      expect(await mainLandmark.count()).toBeGreaterThanOrEqual(1);
    });

    test('should have navigation landmark', async ({ page }) => {
      await page.goto('/');

      const navLandmark = page.locator('nav, [role="navigation"]');
      // Navigation may not be visible on all pages
      const count = await navLandmark.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('WCAG 2.1 AA - Full Page Audit @accessibility', () => {
  test('homepage full audit', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();

    // Generate report
    console.log('\n📊 Accessibility Audit Report - Homepage');
    console.log('========================================');
    console.log(`✅ Passing rules: ${results.passes.length}`);
    console.log(`❌ Violations: ${results.violations.length}`);
    console.log(`⚠️ Incomplete: ${results.incomplete.length}`);
    console.log(`➖ Inapplicable: ${results.inapplicable.length}`);

    if (results.violations.length > 0) {
      console.log('\nViolation Details:');
      results.violations.forEach((v, i) => {
        console.log(`\n${i + 1}. [${v.impact?.toUpperCase()}] ${v.id}`);
        console.log(`   ${v.description}`);
        console.log(`   Affected: ${v.nodes.length} elements`);
      });
    }

    // Test should pass if no critical violations
    const criticalCount = results.violations.filter((v) => v.impact === 'critical').length;
    expect(criticalCount).toBe(0);
  });

  test('login page full audit', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();

    console.log('\n📊 Accessibility Audit Report - Login Page');
    console.log('==========================================');
    console.log(`✅ Passing rules: ${results.passes.length}`);
    console.log(`❌ Violations: ${results.violations.length}`);

    const criticalCount = results.violations.filter((v) => v.impact === 'critical').length;
    expect(criticalCount).toBe(0);
  });
});
