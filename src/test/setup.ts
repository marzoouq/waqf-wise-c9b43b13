import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Make vi globally available
globalThis.vi = vi;

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Create a comprehensive chainable mock for Supabase queries
const createChainableMock = (mockData: unknown[] = []) => {
  const result = { data: mockData, error: null, count: mockData.length };
  
  const chainable: Record<string, unknown> = {
    select: vi.fn(() => chainable),
    insert: vi.fn(() => chainable),
    update: vi.fn(() => chainable),
    upsert: vi.fn(() => chainable),
    delete: vi.fn(() => chainable),
    eq: vi.fn(() => chainable),
    neq: vi.fn(() => chainable),
    gt: vi.fn(() => chainable),
    gte: vi.fn(() => chainable),
    lt: vi.fn(() => chainable),
    lte: vi.fn(() => chainable),
    like: vi.fn(() => chainable),
    ilike: vi.fn(() => chainable),
    is: vi.fn(() => chainable),
    in: vi.fn(() => chainable),
    contains: vi.fn(() => chainable),
    containedBy: vi.fn(() => chainable),
    or: vi.fn(() => chainable),
    and: vi.fn(() => chainable),
    not: vi.fn(() => chainable),
    filter: vi.fn(() => chainable),
    match: vi.fn(() => chainable),
    order: vi.fn(() => chainable),
    limit: vi.fn(() => chainable),
    range: vi.fn(() => chainable),
    single: vi.fn(() => Promise.resolve({ data: mockData[0] || null, error: null })),
    maybeSingle: vi.fn(() => Promise.resolve({ data: mockData[0] || null, error: null })),
    then: vi.fn((resolve) => resolve(result)),
  };
  
  return chainable;
};

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => createChainableMock()),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signUp: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'test/path' }, error: null })),
        download: vi.fn(() => Promise.resolve({ data: new Blob(), error: null })),
        remove: vi.fn(() => Promise.resolve({ data: [], error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://test.com/file' } })),
        list: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
    })),
    removeChannel: vi.fn(),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
  },
}));

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
