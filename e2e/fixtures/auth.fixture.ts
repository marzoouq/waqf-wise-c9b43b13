import { test as base, expect } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Authentication Test Fixtures
 * أدوات مساعدة لاختبارات المصادقة
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

// Test user credentials - empty
export const TEST_CREDENTIALS = {};

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export type UserRole = string;

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

  loginAs: async ({ page: _page }, use) => {
    const loginAs = async (_role: UserRole): Promise<boolean> => {
      return false;
    };
    await use(loginAs);
  },

  loginWithCredentials: async ({ page: _page }, use) => {
    const loginWithCredentials = async (_email: string, _password: string): Promise<boolean> => {
      return false;
    };
    await use(loginWithCredentials);
  },

  logout: async ({ page: _page }, use) => {
    const logout = async (): Promise<void> => {};
    await use(logout);
  },

  isLoggedIn: async ({ page: _page }, use) => {
    const isLoggedIn = async (): Promise<boolean> => {
      return false;
    };
    await use(isLoggedIn);
  },
});

export { expect };

export async function createAuthenticatedClient(_role: UserRole): Promise<SupabaseClient | null> {
  return null;
}

export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export async function waitForAuth(page: Page, _timeout = 10000): Promise<boolean> {
  return false;
}
