/**
 * Integration Tests - Supabase Connection
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Integration - Supabase', () => {
  it('should import supabase client', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    expect(supabase).toBeDefined();
  });

  it('should have auth methods', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    expect(supabase.auth).toBeDefined();
    expect(typeof supabase.auth.signInWithPassword).toBe('function');
    expect(typeof supabase.auth.signOut).toBe('function');
  });

  it('should have database methods', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    expect(typeof supabase.from).toBe('function');
  });

  it('should have storage methods', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    expect(supabase.storage).toBeDefined();
  });

  it('should have realtime methods', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    expect(typeof supabase.channel).toBe('function');
  });
});
