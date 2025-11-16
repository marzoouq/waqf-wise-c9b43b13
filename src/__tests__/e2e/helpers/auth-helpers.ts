import { Page } from '@playwright/test';

export type UserRole = 'nazer' | 'accountant' | 'cashier' | 'archivist' | 'beneficiary' | 'admin';

const credentials = {
  nazer: { email: 'nazer@waqf.sa', password: 'Test@123456' },
  accountant: { email: 'accountant@waqf.sa', password: 'Test@123456' },
  cashier: { email: 'cashier@waqf.sa', password: 'Test@123456' },
  archivist: { email: 'archivist@waqf.sa', password: 'Test@123456' },
  beneficiary: { email: 'beneficiary@waqf.sa', password: 'Test@123456' },
  admin: { email: 'admin@waqf.sa', password: 'Test@123456' },
};

export async function loginAs(page: Page, role: UserRole) {
  const { email, password } = credentials[role];
  
  await page.goto('/auth');
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  // انتظار التوجيه للصفحة الرئيسية بناءً على الدور
  await page.waitForURL(/\/(nazer-dashboard|dashboard|accountant-dashboard|cashier-dashboard|archivist-dashboard|beneficiary-dashboard)/, {
    timeout: 10000
  });
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
