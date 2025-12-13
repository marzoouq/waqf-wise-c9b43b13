/**
 * Supabase Mock للاختبارات
 * يُعاد تصديره من src/test/setup.ts
 */

import { vi } from 'vitest';

// Re-export from setup
export { setMockTableData, clearMockTableData } from '../../test/setup';

// Get supabase mock from the mocked module
export const getMockSupabase = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/integrations/supabase/client').supabase;
};

// Mock لـ Supabase Auth - يمكن استخدامه مباشرة في الاختبارات
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

export const mockSupabase = {
  from: vi.fn(),
  auth: mockSupabaseAuth,
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
