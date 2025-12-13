/**
 * Supabase Mock للاختبارات
 * يُعاد تصديره من src/test/setup.ts
 */

import { vi } from 'vitest';

// Re-export from setup
export { setMockTableData, clearMockTableData } from '../../test/setup';

// Mock لـ Supabase Auth - للاستخدام المباشر في الاختبارات
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

// Note: Tests should import supabase directly from '@/integrations/supabase/client'
// which is automatically mocked in setup.ts
