/**
 * Unified Supabase Mock Utilities
 * 
 * Single source of truth for Supabase mocking in tests.
 * All tests should use these exports for consistency.
 */

// Re-export mock utilities from setup.ts (single source of truth)
export { setMockTableData, clearMockTableData } from '../../test/setup';

// Export the mocked supabase client for assertions
// This is the SAME instance that services use (mocked in setup.ts)
export { supabase as mockSupabase } from '@/integrations/supabase/client';

// Export auth mock for direct access in auth-related tests
import { supabase } from '@/integrations/supabase/client';
export const mockSupabaseAuth = supabase.auth;
