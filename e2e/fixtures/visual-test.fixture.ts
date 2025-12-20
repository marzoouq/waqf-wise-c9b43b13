import { test as base, expect, Page } from '@playwright/test';

/**
 * Visual Test Fixture
 * تثبيت مشترك لاختبارات Visual Regression
 */

// تمديد الاختبار الأساسي مع إعدادات بصرية
export const test = base.extend<{
  visualPage: Page;
}>({
  visualPage: async ({ page }, use) => {
    // انتظار تحميل الصفحة بالكامل
    await page.waitForLoadState('domcontentloaded');
    
    // انتظار تحميل الخطوط العربية
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    
    // انتظار استقرار الشبكة
    await page.waitForLoadState('networkidle').catch(() => {
      // تجاهل timeout إذا كانت الشبكة بطيئة
    });
    
    await use(page);
  },
});

// خيارات اللقطات الافتراضية
export const defaultScreenshotOptions = {
  animations: 'disabled' as const,
  caret: 'hide' as const,
  scale: 'css' as const,
};

// خيارات لقطة الصفحة الكاملة
export const fullPageOptions = {
  ...defaultScreenshotOptions,
  fullPage: true,
};

// خيارات مع إخفاء عناصر ديناميكية
export const maskedOptions = (page: Page, selectors: string[] = []) => ({
  ...defaultScreenshotOptions,
  mask: selectors.map(s => page.locator(s)),
});

// دالة مساعدة لانتظار استقرار الصفحة
export async function waitForPageStability(page: Page, timeout = 1000) {
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(timeout);
}

// دالة مساعدة لتفعيل الوضع الداكن
export async function enableDarkMode(page: Page) {
  await page.evaluate(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  });
  await page.waitForTimeout(300);
}

// دالة مساعدة لتفعيل الوضع الفاتح
export async function enableLightMode(page: Page) {
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    localStorage.setItem('theme', 'light');
  });
  await page.waitForTimeout(300);
}

// تصدير expect من Playwright
export { expect };
