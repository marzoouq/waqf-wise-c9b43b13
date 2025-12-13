/**
 * Test Setup - Vitest Configuration
 */
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, beforeAll, vi } from 'vitest';

// Make vi globally available
globalThis.vi = vi;

// Basic DOM polyfills and environment shims for Vitest
// Ensure `window.matchMedia` exists (some components check it)
if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// Minimal ResizeObserver mock
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  class MockResizeObserver {
    observe() { return; }
    unobserve() { return; }
    disconnect() { return; }
  }
  (globalThis as any).ResizeObserver = MockResizeObserver;
}

// Force navigator language to en-US to avoid Arabic-digit formatting in tests
if (typeof navigator !== 'undefined') {
  try { Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true }); } catch {}
}

// Force Intl.NumberFormat to default to en-US when no locale provided
const _OriginalNumberFormat = Intl.NumberFormat;
// @ts-ignore
Intl.NumberFormat = function (locales?: any, options?: any) {
  if (!locales) locales = 'en-US';
  return new _OriginalNumberFormat(locales, options);
} as any;

// Mock scrollIntoView for Radix UI components (Select, etc.)
Element.prototype.scrollIntoView = vi.fn();

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

// Mock Auth context so components using `useAuth()` work in tests
vi.mock('@/contexts/AuthContext', () => {
  const React = require('react');
  return {
    AuthProvider: ({ children }: any) => children,
    useAuth: () => ({
      user: null,
      profile: null,
      isLoading: false,
      roles: [],
      rolesLoading: false,
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      hasPermission: vi.fn().mockResolvedValue(false),
      isRole: vi.fn().mockResolvedValue(false),
      checkPermissionSync: vi.fn().mockReturnValue(false),
      hasRole: vi.fn().mockReturnValue(false),
    }),
    ROLE_PERMISSIONS: {},
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
