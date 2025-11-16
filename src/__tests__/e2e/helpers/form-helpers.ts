import { Page } from '@playwright/test';

export async function fillForm(page: Page, data: Record<string, string>) {
  for (const [name, value] of Object.entries(data)) {
    const input = page.locator(`[name="${name}"]`);
    const inputType = await input.getAttribute('type');
    
    if (inputType === 'checkbox') {
      if (value === 'true') {
        await input.check();
      }
    } else {
      await input.fill(value);
    }
  }
}

export async function submitForm(page: Page) {
  await page.click('button[type="submit"]');
}

export async function fillAndSubmit(page: Page, data: Record<string, string>) {
  await fillForm(page, data);
  await submitForm(page);
}

export async function selectOption(page: Page, selector: string, value: string) {
  await page.selectOption(selector, value);
}

export async function uploadFile(page: Page, selector: string, filePath: string) {
  await page.setInputFiles(selector, filePath);
}

export async function waitForFormSubmission(page: Page) {
  await page.waitForLoadState('networkidle');
}
