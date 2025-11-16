import { Page } from '@playwright/test';

export async function navigateTo(page: Page, route: string) {
  await page.goto(route);
  await page.waitForLoadState('networkidle');
}

export async function clickSidebarLink(page: Page, linkText: string) {
  await page.click(`nav >> text=${linkText}`);
  await page.waitForLoadState('networkidle');
}

export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');
}

export async function goBack(page: Page) {
  await page.goBack();
  await waitForPageLoad(page);
}

export async function refreshPage(page: Page) {
  await page.reload();
  await waitForPageLoad(page);
}
