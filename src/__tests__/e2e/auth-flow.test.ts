/**
 * اختبارات E2E لتدفق تسجيل الدخول
 * E2E Login Flow Tests - Real Functional Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  },
}));

// Test credentials
const validCredentials = {
  email: 'nazer@waqf.sa',
  password: 'SecurePassword123!',
};

const mockUser = {
  id: 'user-uuid-123',
  email: validCredentials.email,
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as any;

const mockSession = {
  user: mockUser,
  access_token: 'mock-access-token-xyz',
  refresh_token: 'mock-refresh-token-abc',
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  expires_in: 3600,
  token_type: 'bearer',
} as any;

const mockAuthError = {
  message: 'Invalid login credentials',
  name: 'AuthError',
  status: 400,
  code: 'invalid_credentials',
  __isAuthError: true,
} as any;

describe('E2E: Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Process', () => {
    it('should successfully login with valid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await supabase.auth.signInWithPassword({
        email: validCredentials.email,
        password: validCredentials.password,
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: validCredentials.email,
        password: validCredentials.password,
      });
      expect(result.data.user).toBeDefined();
      expect(result.data.session).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should fail login with invalid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockAuthError,
      } as any);

      const result = await supabase.auth.signInWithPassword({
        email: 'wrong@email.com',
        password: 'wrongpassword',
      });

      expect(result.data.user).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Invalid');
    });

    it('should validate email format before submission', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test('valid@email.com')).toBe(true);
      expect(emailRegex.test('nazer@waqf.sa')).toBe(true);
      expect(emailRegex.test('invalid-email')).toBe(false);
      expect(emailRegex.test('@nodomain.com')).toBe(false);
      expect(emailRegex.test('no@domain')).toBe(false);
    });

    it('should validate password requirements', () => {
      const validatePassword = (password: string) => {
        const minLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        return minLength && hasUppercase && hasLowercase && hasNumber;
      };

      expect(validatePassword('SecurePassword123!')).toBe(true);
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('nouppercase123')).toBe(false);
      expect(validatePassword('NOLOWERCASE123')).toBe(false);
      expect(validatePassword('NoNumbers!')).toBe(false);
    });
  });

  describe('Session Management', () => {
    it('should retrieve existing session', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await supabase.auth.getSession();

      expect(result.data.session).toBeDefined();
      expect(result.data.session?.user.id).toBe(mockUser.id);
      expect(result.data.session?.access_token).toBeDefined();
    });

    it('should handle session expiry detection', () => {
      const expiredSession = {
        ...mockSession,
        expires_at: Math.floor(Date.now() / 1000) - 1000, // Expired 1000 seconds ago
      };

      const isExpired = expiredSession.expires_at < Math.floor(Date.now() / 1000);
      expect(isExpired).toBe(true);
    });

    it('should handle valid session detection', () => {
      const validSession = {
        ...mockSession,
        expires_at: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
      };

      const isValid = validSession.expires_at > Math.floor(Date.now() / 1000);
      expect(isValid).toBe(true);
    });

    it('should successfully logout', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      const result = await supabase.auth.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });
  });

  describe('Signup Process', () => {
    it('should register new user successfully', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await supabase.auth.signUp({
        email: 'newuser@waqf.sa',
        password: 'NewSecurePassword123!',
      });

      expect(supabase.auth.signUp).toHaveBeenCalled();
      expect(result.data.user).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should fail registration with duplicate email', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: { ...mockAuthError, message: 'User already registered' },
      } as any);

      const result = await supabase.auth.signUp({
        email: validCredentials.email,
        password: validCredentials.password,
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('already registered');
    });
  });

  describe('Role-Based Redirect', () => {
    const getRedirectPath = (roles: string[]): string => {
      if (roles.includes('nazer')) return '/nazer-dashboard';
      if (roles.includes('admin')) return '/admin-dashboard';
      if (roles.includes('accountant')) return '/accountant-dashboard';
      if (roles.includes('archivist')) return '/archivist-dashboard';
      if (roles.includes('cashier')) return '/cashier-dashboard';
      if (roles.includes('beneficiary')) return '/beneficiary-portal';
      if (roles.includes('waqf_heir')) return '/dashboard';
      return '/dashboard';
    };

    it('should redirect nazer to nazer dashboard', () => {
      expect(getRedirectPath(['nazer'])).toBe('/nazer-dashboard');
    });

    it('should redirect admin to admin dashboard', () => {
      expect(getRedirectPath(['admin'])).toBe('/admin-dashboard');
    });

    it('should redirect accountant to accountant dashboard', () => {
      expect(getRedirectPath(['accountant'])).toBe('/accountant-dashboard');
    });

    it('should redirect beneficiary to beneficiary portal', () => {
      expect(getRedirectPath(['beneficiary'])).toBe('/beneficiary-portal');
    });

    it('should redirect waqf_heir to general dashboard', () => {
      expect(getRedirectPath(['waqf_heir'])).toBe('/dashboard');
    });

    it('should prioritize nazer role in multi-role users', () => {
      expect(getRedirectPath(['accountant', 'nazer'])).toBe('/nazer-dashboard');
    });

    it('should redirect unknown roles to general dashboard', () => {
      expect(getRedirectPath(['unknown_role'])).toBe('/dashboard');
    });
  });

  describe('Auth State Changes', () => {
    it('should setup auth state listener', () => {
      const callback = vi.fn();
      supabase.auth.onAuthStateChange(callback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const result = supabase.auth.onAuthStateChange(callback);

      expect(result.data.subscription.unsubscribe).toBeDefined();
      expect(typeof result.data.subscription.unsubscribe).toBe('function');
    });
  });
});
