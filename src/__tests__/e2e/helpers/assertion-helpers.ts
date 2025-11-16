import { Page, expect } from '@playwright/test';

export async function expectVisible(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeVisible();
}

export async function expectNotVisible(page: Page, selector: string) {
  await expect(page.locator(selector)).not.toBeVisible();
}

export async function expectText(page: Page, selector: string, text: string) {
  await expect(page.locator(selector)).toContainText(text);
}

export async function expectCount(page: Page, selector: string, count: number) {
  await expect(page.locator(selector)).toHaveCount(count);
}

export async function expectToast(page: Page, message: string) {
  await expect(page.locator('[role="status"]')).toContainText(message);
}

export async function expectUrl(page: Page, url: string | RegExp) {
  await expect(page).toHaveURL(url);
}

export async function expectEnabled(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeEnabled();
}

export async function expectDisabled(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeDisabled();
}
