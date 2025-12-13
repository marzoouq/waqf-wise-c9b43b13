import { vi } from 'vitest';

/*
 * Shared Supabase Mock Utilities for tests
 * 
 * IMPORTANT: Tests should import `supabase` from '@/integrations/supabase/client'
 * which is automatically mocked in setup.ts
 * 
 * Use setMockTableData and clearMockTableData from 'src/test/setup' for data control
 */

// Re-export utilities from setup.ts
export { setMockTableData, clearMockTableData } from '../../test/setup';

// Legacy mockSupabase for backward compatibility with existing tests
const mockTableData: Record<string, unknown[]> = {};

const createMockQueryBuilder = <T>(data: T[] = []) => {
  let operation = 'select';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder: any = {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    then: async (onfulfilled?: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any;
      if (operation === 'select') result = { data, error: null, count: data.length };
      else if (operation === 'delete') result = { data: null, error: null };
      else result = { data: data[0] || null, error: null };
      if (onfulfilled) return onfulfilled(result);
      return result;
    },
  };
  return builder;
};

export const mockSupabase = {
  from: vi.fn((tableName: string) => {
    const data = (mockTableData[tableName] || []) as unknown[];
    return createMockQueryBuilder(data);
  }),
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
};

// Helper to set mock table data for legacy mockSupabase
export const setLegacyMockTableData = <T>(tableName: string, data: T[]) => {
  mockTableData[tableName] = data;
};

export const clearLegacyMockTableData = () => {
  Object.keys(mockTableData).forEach(k => delete mockTableData[k]);
  vi.clearAllMocks();
};

// Re-export mockSupabase Auth for direct use
export const mockSupabaseAuth = mockSupabase.auth;
