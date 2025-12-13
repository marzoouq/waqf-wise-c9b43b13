/**
 * Test Setup - Vitest Configuration
 */
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, beforeAll, vi } from 'vitest';

// Make vi globally available
globalThis.vi = vi;

// Mock Supabase BEFORE anything else loads
vi.mock('@/integrations/supabase/client', () => {
  const mockTableData: Record<string, unknown[]> = {};

  const createMockQueryBuilder = <T>(data: T[] = []) => {
    let operation = 'select';
    const builder = {
      select: () => { operation = 'select'; return builder; },
      insert: () => { operation = 'insert'; return builder; },
      update: () => { operation = 'update'; return builder; },
      delete: () => { operation = 'delete'; return builder; },
      upsert: () => { operation = 'upsert'; return builder; },
      eq: () => builder,
      neq: () => builder,
      in: () => builder,
      gt: () => builder,
      gte: () => builder,
      lt: () => builder,
      lte: () => builder,
      like: () => builder,
      ilike: () => builder,
      is: () => builder,
      or: (_filters?: string) => builder,
      order: () => builder,
      limit: () => builder,
      range: () => builder,
      single: async () => ({ data: data[0] || null, error: null }),
      maybeSingle: async () => ({ data: data[0] || null, error: null }),
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
    setMockTableData: <T>(tableName: string, data: T[]) => {
      mockTableData[tableName] = data;
    },
    clearMockTableData: () => {
      Object.keys(mockTableData).forEach(key => delete mockTableData[key]);
    },
  };
});

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Export mock utilities
export const setMockTableData = <T>(tableName: string, data: T[]) => {
  const { setMockTableData: setter } = require('@/integrations/supabase/client');
  setter(tableName, data);
};

export const clearMockTableData = () => {
  const { clearMockTableData: clearer } = require('@/integrations/supabase/client');
  clearer();
};

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
