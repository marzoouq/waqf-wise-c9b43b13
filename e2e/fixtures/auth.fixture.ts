import { test as base, expect } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Authentication Test Fixtures
 * أدوات مساعدة لاختبارات المصادقة
 */

// Test user credentials from environment
export const TEST_CREDENTIALS = {
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@test.waqf.sa',
    password: process.env.TEST_ADMIN_PASSWORD || 'TestAdmin123!',
  },
  nazer: {
    email: process.env.TEST_NAZER_EMAIL || 'nazer@test.waqf.sa',
    password: process.env.TEST_NAZER_PASSWORD || 'TestNazer123!',
  },
  accountant: {
    email: process.env.TEST_ACCOUNTANT_EMAIL || 'accountant@test.waqf.sa',
    password: process.env.TEST_ACCOUNTANT_PASSWORD || 'TestAccountant123!',
  },
  beneficiary: {
    email: process.env.TEST_BENEFICIARY_EMAIL || 'beneficiary@test.waqf.sa',
    password: process.env.TEST_BENEFICIARY_PASSWORD || 'TestBeneficiary123!',
  },
  user: {
    email: process.env.TEST_USER_EMAIL || 'test@waqf.sa',
    password: process.env.TEST_USER_PASSWORD || 'Test123!',
  },
};

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export type UserRole = keyof typeof TEST_CREDENTIALS;

interface AuthFixtures {
  supabase: SupabaseClient;
  loginAs: (role: UserRole) => Promise<boolean>;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoggedIn: () => Promise<boolean>;
}

/**
 * Extended test with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
  supabase: async ({}, use) => {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await use(client);
    await client.auth.signOut();
  },

  loginAs: async ({ page }, use) => {
    const loginAs = async (role: UserRole): Promise<boolean> => {
      const credentials = TEST_CREDENTIALS[role];
      
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();

      if (!(await emailInput.isVisible())) {
        console.warn('Email input not found');
        return false;
      }

      await emailInput.fill(credentials.email);
      await passwordInput.fill(credentials.password);
      await page.locator('button[type="submit"]').first().click();

      try {
        await page.waitForURL(/\/(dashboard|redirect|nazer|accountant|beneficiary|home)/, {
          timeout: 10000,
        });
        return true;
      } catch {
        console.warn(`Login as ${role} failed`);
        return false;
      }
    };

    await use(loginAs);
  },

  loginWithCredentials: async ({ page }, use) => {
    const loginWithCredentials = async (email: string, password: string): Promise<boolean> => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();

      if (!(await emailInput.isVisible())) {
        return false;
      }

      await emailInput.fill(email);
      await passwordInput.fill(password);
      await page.locator('button[type="submit"]').first().click();

      try {
        await page.waitForURL(/\/(dashboard|redirect|home)/, { timeout: 10000 });
        return true;
      } catch {
        return false;
      }
    };

    await use(loginWithCredentials);
  },

  logout: async ({ page }, use) => {
    const logout = async (): Promise<void> => {
      // Look for logout button
      const userMenu = page.locator(
        '[aria-label*="user"], button:has([class*="avatar"])'
      ).first();

      if (await userMenu.isVisible()) {
        await userMenu.click();
        await page.waitForTimeout(300);
      }

      const logoutButton = page.locator(
        'button:has-text("خروج"), button:has-text("تسجيل الخروج")'
      ).first();

      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForURL(/\/(login|auth|home|\/)/, { timeout: 5000 }).catch(() => {});
      }
    };

    await use(logout);
  },

  isLoggedIn: async ({ page }, use) => {
    const isLoggedIn = async (): Promise<boolean> => {
      const currentUrl = page.url();
      
      // Not logged in if on login page
      if (currentUrl.includes('/login') || currentUrl.includes('/auth')) {
        return false;
      }

      // Check for user menu or dashboard elements
      const userIndicators = page.locator(
        '[aria-label*="user"], [class*="avatar"], text=تسجيل الخروج'
      );

      return (await userIndicators.first().isVisible().catch(() => false));
    };

    await use(isLoggedIn);
  },
});

export { expect };

/**
 * Helper function to create authenticated Supabase client
 */
export async function createAuthenticatedClient(role: UserRole): Promise<SupabaseClient | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured');
    return null;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const credentials = TEST_CREDENTIALS[role];

  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    console.warn(`Failed to authenticate as ${role}:`, error.message);
    return null;
  }

  return supabase;
}

/**
 * Helper to check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Wait for authentication to complete
 */
export async function waitForAuth(page: any, timeout = 10000): Promise<boolean> {
  try {
    await page.waitForURL(/\/(dashboard|redirect|home)/, { timeout });
    return true;
  } catch {
    return false;
  }
}
