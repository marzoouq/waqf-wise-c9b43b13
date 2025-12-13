/**
 * Test Setup - Vitest Configuration
 */
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, beforeAll, vi } from 'vitest';
import React from 'react';

// Make vi globally available
globalThis.vi = vi;

// Mock scrollIntoView for Radix UI components (Select, etc.)
Element.prototype.scrollIntoView = vi.fn();

// Mock matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Shared mock data store
const mockTableData: Record<string, unknown[]> = {};

// Export mock utilities directly (not via require)
export const setMockTableData = <T>(tableName: string, data: T[]) => {
  mockTableData[tableName] = data;
};

export const clearMockTableData = () => {
  Object.keys(mockTableData).forEach(key => delete mockTableData[key]);
};

const createMockQueryBuilder = <T>(data: T[] = []) => {
  let operation = 'select';
  const builder = {
    select: (_columns?: string) => { operation = 'select'; return builder; },
    insert: (_data?: unknown) => { operation = 'insert'; return builder; },
    update: (_data?: unknown) => { operation = 'update'; return builder; },
    delete: () => { operation = 'delete'; return builder; },
    upsert: (_data?: unknown) => { operation = 'upsert'; return builder; },
    eq: (_column?: string, _value?: unknown) => builder,
    neq: (_column?: string, _value?: unknown) => builder,
    in: (_column?: string, _values?: unknown[]) => builder,
    gt: (_column?: string, _value?: unknown) => builder,
    gte: (_column?: string, _value?: unknown) => builder,
    lt: (_column?: string, _value?: unknown) => builder,
    lte: (_column?: string, _value?: unknown) => builder,
    like: (_column?: string, _pattern?: string) => builder,
    ilike: (_column?: string, _pattern?: string) => builder,
    is: (_column?: string, _value?: unknown) => builder,
    not: (_column?: string, _operator?: string, _value?: unknown) => builder,
    or: (_filters?: string) => builder,
    and: (_filters?: string) => builder,
    filter: (_column?: string, _operator?: string, _value?: unknown) => builder,
    match: (_query?: Record<string, unknown>) => builder,
    contains: (_column?: string, _value?: unknown) => builder,
    containedBy: (_column?: string, _value?: unknown) => builder,
    textSearch: (_column?: string, _query?: string, _options?: unknown) => builder,
    order: (_column?: string, _options?: { ascending?: boolean }) => builder,
    limit: (_count?: number) => builder,
    range: (_from?: number, _to?: number) => builder,
    count: (_options?: { count?: string; head?: boolean }) => builder,
    single: async () => ({ data: data[0] || null, error: null }),
    maybeSingle: async () => ({ data: data[0] || null, error: null }),
    throwOnError: () => builder,
    then: async <TResult>(
      onfulfilled?: ((value: { data: T[]; error: null; count: number }) => TResult | PromiseLike<TResult>) | null
    ): Promise<TResult> => {
      let result: { data: T[] | T | null; error: null; count?: number };
      if (operation === 'select') {
        result = { data: data, error: null, count: data.length };
      } else if (operation === 'delete') {
        result = { data: null, error: null };
      } else {
        result = { data: data[0] || null, error: null };
      }
      if (onfulfilled) {
        return onfulfilled(result as { data: T[]; error: null; count: number });
      }
      return result as unknown as TResult;
    },
  };
  return builder;
};

// Mock Supabase BEFORE anything else loads
vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      from: vi.fn((tableName: string) => createMockQueryBuilder(mockTableData[tableName] || [])),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
        signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        signInWithOAuth: vi.fn().mockResolvedValue({ data: { url: '' }, error: null }),
        resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
        updateUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn().mockResolvedValue({ data: { path: 'test/path' }, error: null }),
          download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
          remove: vi.fn().mockResolvedValue({ data: [], error: null }),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/file' } }),
          list: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      },
      functions: {
        invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
      },
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
      }),
      removeChannel: vi.fn(),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  };
});

// Mock AuthContext with comprehensive auth state
let mockAuthRoles: string[] = ['admin'];
let mockAuthUser: { id: string; email: string } | null = { id: 'test-user-id', email: 'test@waqf.sa' };

export const setMockAuthRoles = (roles: string[]) => {
  mockAuthRoles = roles;
};

export const setMockAuthUser = (user: { id: string; email: string } | null) => {
  mockAuthUser = user;
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockAuthUser,
    profile: mockAuthUser ? { id: mockAuthUser.id, full_name: 'Test User' } : null,
    isLoading: false,
    roles: mockAuthRoles,
    rolesLoading: false,
    signIn: vi.fn().mockResolvedValue({ user: mockAuthUser, session: {} }),
    signInWithGoogle: vi.fn().mockResolvedValue({ url: '' }),
    signUp: vi.fn().mockResolvedValue({ user: mockAuthUser, session: {} }),
    signOut: vi.fn().mockResolvedValue(undefined),
    hasPermission: vi.fn().mockResolvedValue(true),
    isRole: vi.fn().mockResolvedValue(true),
    checkPermissionSync: vi.fn().mockReturnValue(true),
    hasRole: vi.fn((role: string) => mockAuthRoles.includes(role)),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock sonner toast - must be both a function and object
vi.mock('sonner', () => {
  const toastFn = Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn(),
  });
  return {
    toast: toastFn,
    Toaster: () => null,
  };
});

// Suppress console errors during tests
beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Reset mock data before each test
beforeEach(() => {
  clearMockTableData();
  vi.clearAllMocks();
});
