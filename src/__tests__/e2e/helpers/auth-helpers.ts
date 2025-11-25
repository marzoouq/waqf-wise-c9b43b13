import { Page } from '@playwright/test';
import { TEST_CREDENTIALS, getTestCredentials } from './test-credentials';

export type UserRole = 'nazer' | 'accountant' | 'cashier' | 'archivist' | 'beneficiary' | 'admin';

/**
 * تسجيل الدخول كدور محدد
 * يدعم تسجيل الدخول بالبريد الإلكتروني أو رقم الهوية
 */
export async function loginAs(page: Page, role: UserRole) {
  const credentials = getTestCredentials(role);
  
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');
  
  // البحث عن حقل تسجيل الدخول (مرن - يدعم email أو username أو national_id)
  const loginField = page.locator(
    'input[type="email"], input[name="username"], input[name="identifier"]'
  ).first();
  
  await loginField.waitFor({ state: 'visible', timeout: 5000 });
  await loginField.fill(credentials.identifier);
  
  await page.fill('input[type="password"]', credentials.password);
  await page.click('button[type="submit"]');
  
  // انتظار التوجيه للصفحة الرئيسية بناءً على الدور
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('text=تسجيل الخروج');
  await page.waitForURL('/auth', { timeout: 5000 });
}

export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector('[data-testid="user-menu"]', { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}
