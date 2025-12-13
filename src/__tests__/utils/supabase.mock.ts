/**
 * Supabase Mock للاختبارات
 * يحاكي جميع عمليات Supabase
 */

import { vi } from 'vitest';

// نوع البيانات المرجعة من الاستعلامات
interface MockQueryResult<T> {
  data: T | null;
  error: Error | null;
  count?: number;
}

// بناء سلسلة الاستعلامات
interface MockQueryBuilder<T> {
  select: (columns?: string, options?: { count?: string }) => MockQueryBuilder<T>;
  insert: (data: Partial<T> | Partial<T>[]) => MockQueryBuilder<T>;
  update: (data: Partial<T>) => MockQueryBuilder<T>;
  delete: () => MockQueryBuilder<T>;
  upsert: (data: Partial<T> | Partial<T>[]) => MockQueryBuilder<T>;
  eq: (column: string, value: unknown) => MockQueryBuilder<T>;
  neq: (column: string, value: unknown) => MockQueryBuilder<T>;
  in: (column: string, values: unknown[]) => MockQueryBuilder<T>;
  gt: (column: string, value: unknown) => MockQueryBuilder<T>;
  gte: (column: string, value: unknown) => MockQueryBuilder<T>;
  lt: (column: string, value: unknown) => MockQueryBuilder<T>;
  lte: (column: string, value: unknown) => MockQueryBuilder<T>;
  like: (column: string, pattern: string) => MockQueryBuilder<T>;
  ilike: (column: string, pattern: string) => MockQueryBuilder<T>;
  is: (column: string, value: unknown) => MockQueryBuilder<T>;
  or: (filters: string) => MockQueryBuilder<T>;
  order: (column: string, options?: { ascending?: boolean }) => MockQueryBuilder<T>;
  limit: (count: number) => MockQueryBuilder<T>;
  range: (from: number, to: number) => MockQueryBuilder<T>;
  single: () => Promise<MockQueryResult<T>>;
  maybeSingle: () => Promise<MockQueryResult<T>>;
  then: <TResult>(
    onfulfilled?: ((value: { data: T[]; error: null; count: number }) => TResult | PromiseLike<TResult>) | null
  ) => Promise<TResult>;
}

// إنشاء query builder وهمي
const createMockQueryBuilder = <T>(mockData: T[] = []): MockQueryBuilder<T> => {
  let operation: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  const builder: MockQueryBuilder<T> = {
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
    or: () => builder,
    order: () => builder,
    limit: () => builder,
    range: () => builder,
    single: async () => ({ data: mockData[0] || null, error: null }),
    maybeSingle: async () => ({ data: mockData[0] || null, error: null }),
    then: async <TResult>(
      onfulfilled?: ((value: { data: T[]; error: null; count: number }) => TResult | PromiseLike<TResult>) | null
    ): Promise<TResult> => {
      let result: { data: T[] | T | null; error: null; count?: number };
      if (operation === 'select') {
        result = { data: mockData, error: null, count: mockData.length };
      } else if (operation === 'delete') {
        result = { data: null, error: null };
      } else if (operation === 'insert' || operation === 'update' || operation === 'upsert') {
        result = { data: mockData[0] || null, error: null };
      } else {
        result = { data: mockData, error: null, count: mockData.length };
      }
      if (onfulfilled) {
        return onfulfilled(result as { data: T[]; error: null; count: number });
      }
      return result as unknown as TResult;
    },
  };
  return builder;
};

// Mock لـ Supabase Auth
export const mockSupabaseAuth = {
  getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
  signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  signInWithOAuth: vi.fn().mockResolvedValue({ data: { url: '' }, error: null }),
  resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
  updateUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
};

// Mock لـ Supabase Storage
export const mockSupabaseStorage = {
  from: vi.fn().mockReturnValue({
    upload: vi.fn().mockResolvedValue({ data: { path: 'test/path' }, error: null }),
    download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
    remove: vi.fn().mockResolvedValue({ data: [], error: null }),
    getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/file' } }),
    list: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
};

// Mock لـ Supabase Functions
export const mockSupabaseFunctions = {
  invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
};

// Mock لـ Supabase Realtime
export const mockSupabaseRealtime = {
  channel: vi.fn().mockReturnValue({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
  }),
  removeChannel: vi.fn(),
};

// مخزن البيانات الوهمية للجداول
const mockTableData: Record<string, unknown[]> = {};

// إضافة بيانات وهمية لجدول
export const setMockTableData = <T>(tableName: string, data: T[]) => {
  mockTableData[tableName] = data;
};

// مسح البيانات الوهمية
export const clearMockTableData = () => {
  Object.keys(mockTableData).forEach(key => delete mockTableData[key]);
};

// Mock الرئيسي لـ Supabase
export const createMockSupabaseClient = () => ({
  from: vi.fn((tableName: string) => {
    const data = mockTableData[tableName] || [];
    return createMockQueryBuilder(data);
  }),
  auth: mockSupabaseAuth,
  storage: mockSupabaseStorage,
  functions: mockSupabaseFunctions,
  channel: mockSupabaseRealtime.channel,
  removeChannel: mockSupabaseRealtime.removeChannel,
  rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
});

// تصدير Mock
export const mockSupabase = createMockSupabaseClient();
