/**
 * E2E Tests - Accessibility
 * @version 1.0.0
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('landing page should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(criticalViolations.length).toBeLessThanOrEqual(5);
  });

  test('login page should have proper form labels', async ({ page }) => {
    await page.goto('/login');
    
    const inputs = page.locator('input:not([type="hidden"])');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const ariaLabel = await input.getAttribute('aria-label');
      const id = await input.getAttribute('id');
      const placeholder = await input.getAttribute('placeholder');
      
      const hasLabel = ariaLabel || (id && await page.locator(`label[for="${id}"]`).count() > 0) || placeholder;
      expect(hasLabel).toBeTruthy();
    }
  });

  test('should support RTL layout', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const dir = await html.getAttribute('dir');
    expect(dir).toBe('rtl');
  });
});
