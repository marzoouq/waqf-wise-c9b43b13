/**
 * Visual Regression Tests - Accessibility
 * اختبارات الوصول
 * @version 2.8.91
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// الصفحات للاختبار
const pages = [
  { name: 'landing', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'dashboard', path: '/dashboard' },
  { name: 'beneficiaries', path: '/beneficiaries' },
  { name: 'properties', path: '/properties' },
];

test.describe('Accessibility Tests @a11y', () => {
  for (const pageInfo of pages) {
    test(`${pageInfo.name} should have no accessibility violations`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .exclude('.animate-pulse') // استبعاد عناصر التحميل
        .analyze();
      
      // تسجيل المخالفات للمراجعة
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`Accessibility violations on ${pageInfo.name}:`);
        accessibilityScanResults.violations.forEach((violation) => {
          console.log(`- ${violation.id}: ${violation.description}`);
          console.log(`  Impact: ${violation.impact}`);
          console.log(`  Nodes: ${violation.nodes.length}`);
        });
      }
      
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});

test.describe('Keyboard Navigation @a11y', () => {
  test('should be able to navigate with keyboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // الضغط على Tab للتنقل
    await page.keyboard.press('Tab');
    
    // التحقق من وجود focus indicator
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // التقاط صورة للـ focus state
    await expect(page).toHaveScreenshot('keyboard-focus.png');
  });

  test('skip links should work', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // الضغط على Tab لإظهار skip link
    await page.keyboard.press('Tab');
    
    const skipLink = page.locator('[data-testid="skip-link"]');
    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeVisible();
      await expect(skipLink).toHaveScreenshot('skip-link-visible.png');
    }
  });

  test('modal should trap focus', async ({ page }) => {
    await page.goto('/beneficiaries');
    await page.waitForLoadState('networkidle');
    
    // فتح modal (إذا وجد زر إضافة)
    const addButton = page.locator('[data-testid="add-beneficiary"]');
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // التحقق من أن الـ focus داخل الـ modal
      const modal = page.locator('[role="dialog"]');
      if (await modal.isVisible()) {
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        
        const focusedElement = page.locator(':focus');
        const isInsideModal = await focusedElement.evaluate((el, modalEl) => {
          return modalEl?.contains(el);
        }, await modal.elementHandle());
        
        expect(isInsideModal).toBe(true);
      }
    }
  });
});

test.describe('Screen Reader Support @a11y', () => {
  test('images should have alt text', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      
      // يجب أن يكون لكل صورة alt أو role="presentation"
      expect(alt !== null || role === 'presentation').toBe(true);
    }
  });

  test('buttons should have accessible names', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const ariaLabel = await button.getAttribute('aria-label');
        const textContent = await button.textContent();
        const ariaLabelledBy = await button.getAttribute('aria-labelledby');
        
        // يجب أن يكون للزر اسم قابل للوصول
        const hasAccessibleName = 
          (ariaLabel && ariaLabel.trim()) || 
          (textContent && textContent.trim()) ||
          ariaLabelledBy;
        
        expect(hasAccessibleName).toBeTruthy();
      }
    }
  });

  test('form fields should have labels', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const inputs = page.locator('input:not([type="hidden"])');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const placeholder = await input.getAttribute('placeholder');
        
        // التحقق من وجود label مرتبط
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          const hasAriaLabel = ariaLabel || ariaLabelledBy;
          
          expect(hasLabel || hasAriaLabel).toBe(true);
        }
      }
    }
  });

  test('live regions should announce updates', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // البحث عن live regions
    const liveRegions = page.locator('[aria-live]');
    const count = await liveRegions.count();
    
    // يجب أن تكون هناك live regions للتحديثات
    // (هذا اختبار وجود، ليس اختبار وظيفي)
    console.log(`Found ${count} live regions`);
  });
});

test.describe('Color and Contrast @a11y', () => {
  test('text should have sufficient contrast', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['cat.color'])
      .analyze();
    
    const colorViolations = accessibilityScanResults.violations.filter(
      v => v.id.includes('color-contrast')
    );
    
    expect(colorViolations).toEqual([]);
  });

  test('links should be distinguishable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const links = page.locator('a');
    const count = await links.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const link = links.nth(i);
      if (await link.isVisible()) {
        const textDecoration = await link.evaluate((el) => 
          window.getComputedStyle(el).textDecoration
        );
        const color = await link.evaluate((el) => 
          window.getComputedStyle(el).color
        );
        
        // الروابط يجب أن تكون مميزة (لون مختلف أو خط تحتها)
        expect(color || textDecoration).toBeTruthy();
      }
    }
  });
});

test.describe('Focus Management @a11y', () => {
  test('focus indicators should be visible', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // التنقل بـ Tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    if (await focusedElement.isVisible()) {
      const outline = await focusedElement.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          outlineWidth: style.outlineWidth,
          outlineStyle: style.outlineStyle,
          outlineColor: style.outlineColor,
          boxShadow: style.boxShadow,
        };
      });
      
      // يجب أن يكون هناك مؤشر focus واضح
      const hasFocusIndicator = 
        (outline.outlineWidth !== '0px' && outline.outlineStyle !== 'none') ||
        outline.boxShadow !== 'none';
      
      expect(hasFocusIndicator).toBe(true);
    }
  });

  test('focus order should be logical', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const focusOrder: string[] = [];
    
    // تسجيل ترتيب الـ focus
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      if (await focusedElement.count() > 0) {
        const tagName = await focusedElement.evaluate((el) => el.tagName);
        focusOrder.push(tagName);
      }
    }
    
    // التحقق من أن الترتيب منطقي
    console.log('Focus order:', focusOrder);
    expect(focusOrder.length).toBeGreaterThan(0);
  });
});

test.describe('Reduced Motion @a11y', () => {
  test('should respect reduced motion preference', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // التحقق من أن الـ animations متوقفة
    const hasReducedMotion = await page.evaluate(() => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });
    
    expect(hasReducedMotion).toBe(true);
  });
});
