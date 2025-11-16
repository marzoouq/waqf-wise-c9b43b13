import { Page } from '@playwright/test';

export async function waitForElement(page: Page, selector: string, timeout = 5000) {
  await page.waitForSelector(selector, { timeout });
}

export async function waitForText(page: Page, text: string, timeout = 5000) {
  await page.waitForSelector(`text=${text}`, { timeout });
}

export async function waitForApiResponse(page: Page, url: string | RegExp) {
  await page.waitForResponse(url);
}

export async function waitForNavigation(page: Page) {
  await page.waitForLoadState('networkidle');
}

export async function waitForToastToDisappear(page: Page) {
  await page.waitForSelector('[role="status"]', { state: 'hidden', timeout: 5000 });
}

export async function waitForDataLoad(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // إعطاء وقت إضافي للـ rendering
}
