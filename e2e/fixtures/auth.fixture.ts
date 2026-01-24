import { test as base, expect } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Authentication Test Fixtures
 * أدوات مساعدة لاختبارات المصادقة
 */

// Test user credentials
export const TEST_CREDENTIALS = {
  admin: { email: 'admin@waqf.test', password: 'admin123' },
  accountant: { email: 'accountant@waqf.test', password: 'accountant123' },
  nazer: { email: 'nazer@waqf.test', password: 'nazer123' },
  cashier: { email: 'cashier@waqf.test', password: 'cashier123' },
};

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export type UserRole = 'admin' | 'accountant' | 'nazer' | 'cashier';

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
  supabase: async (_unusedWorkerInfo, use) => {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await use(client);
    await client.auth.signOut();
  },

  loginAs: async ({ page }, use) => {
    const loginAs = async (role: UserRole): Promise<boolean> => {
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, skipping real login');
        return false;
      }

      const credentials = TEST_CREDENTIALS[role];
      if (!credentials) {
        console.warn(`No credentials found for role: ${role}`);
        return false;
      }

      try {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        const emailInput = page.locator('input[type="email"], input[name="email"]');
        const passwordInput = page.locator('input[type="password"], input[name="password"]');
        const submitButton = page.locator('button[type="submit"]');

        if (await emailInput.isVisible({ timeout: 2000 })) {
          await emailInput.fill(credentials.email);
          await passwordInput.fill(credentials.password);
          await submitButton.click();
          
          await page.waitForURL(/\/(dashboard|admin|nazer|cashier)/, { 
            timeout: 10000 
          }).catch(() => false);
          
          return await waitForAuth(page);
        }
        return false;
      } catch (error) {
        console.error(`Login failed for role ${role}:`, error);
        return false;
      }
    };
    await use(loginAs);
  },

  loginWithCredentials: async ({ page }, use) => {
    const loginWithCredentials = async (email: string, password: string): Promise<boolean> => {
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, skipping real login');
        return false;
      }

      try {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        const emailInput = page.locator('input[type="email"], input[name="email"]');
        const passwordInput = page.locator('input[type="password"], input[name="password"]');
        const submitButton = page.locator('button[type="submit"]');

        if (await emailInput.isVisible({ timeout: 2000 })) {
          await emailInput.fill(email);
          await passwordInput.fill(password);
          await submitButton.click();
          
          await page.waitForURL(/\/(dashboard|admin|nazer|cashier)/, { 
            timeout: 10000 
          }).catch(() => false);
          
          return await waitForAuth(page);
        }
        return false;
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    };
    await use(loginWithCredentials);
  },

  logout: async ({ page }, use) => {
    const logout = async (): Promise<void> => {
      try {
        // البحث عن زر تسجيل الخروج
        const logoutButton = page.locator('button:has-text("تسجيل الخروج"), button:has-text("خروج"), [aria-label*="logout"]');
        
        if (await logoutButton.isVisible({ timeout: 2000 })) {
          await logoutButton.click();
          await page.waitForURL('/login', { timeout: 5000 }).catch(() => {});
        }
      } catch (error) {
        console.warn('Logout failed:', error);
      }
    };
    await use(logout);
  },

  isLoggedIn: async ({ page }, use) => {
    const isLoggedIn = async (): Promise<boolean> => {
      try {
        const url = page.url();
        // إذا كنا في صفحة غير login، نعتبر المستخدم مسجل دخول
        if (!url.includes('/login')) {
          return true;
        }
        
        // التحقق من وجود عناصر تدل على تسجيل الدخول
        const userMenu = page.locator('[class*="user-menu"], [class*="profile"], [aria-label*="user"]');
        return await userMenu.isVisible({ timeout: 1000 }).catch(() => false);
      } catch {
        return false;
      }
    };
    await use(isLoggedIn);
  },
});

export { expect };

export async function createAuthenticatedClient(role: UserRole): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured');
    return null;
  }

  const credentials = TEST_CREDENTIALS[role];
  if (!credentials) {
    console.warn(`No credentials found for role: ${role}`);
    return null;
  }

  try {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error || !data.session) {
      console.error('Authentication failed:', error);
      return null;
    }

    return client;
  } catch (error) {
    console.error('Failed to create authenticated client:', error);
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export async function waitForAuth(page: any, timeout = 10000): Promise<boolean> {
  try {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const url = page.url();
      
      // إذا وصلنا لصفحة غير login، نجحت المصادقة
      if (!url.includes('/login')) {
        return true;
      }
      
      // انتظار 500ms قبل المحاولة التالية
      await page.waitForTimeout(500);
    }
    
    return false;
  } catch (error) {
    console.error('waitForAuth failed:', error);
    return false;
  }
}
