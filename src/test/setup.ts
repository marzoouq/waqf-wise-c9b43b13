import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// Make vi globally available
globalThis.vi = vi;

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Store for mock table data - can be set per test
const mockTableData: Record<string, unknown[]> = {};

// Export functions to control mock data in tests
export const setMockTableData = <T>(tableName: string, data: T[]) => {
  mockTableData[tableName] = data;
};

export const clearMockTableData = () => {
  Object.keys(mockTableData).forEach(key => delete mockTableData[key]);
};

// Reset mock data before each test
beforeEach(() => {
  clearMockTableData();
});

// Create a comprehensive chainable mock for Supabase queries
const createChainableMock = (tableName: string) => {
  const getData = () => mockTableData[tableName] || [];
  
  const chainable: Record<string, unknown> = {};
  
  // All chainable methods return the chainable object
  const chainableMethods = [
    'select', 'insert', 'update', 'upsert', 'delete',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
    'like', 'ilike', 'is', 'in', 'contains', 'containedBy',
    'or', 'and', 'not', 'filter', 'match', 'order', 'limit', 'range',
    'textSearch', 'overlaps', 'rangeGt', 'rangeGte', 'rangeLt', 'rangeLte', 'rangeAdjacent'
  ];
  
  chainableMethods.forEach(method => {
    chainable[method] = vi.fn(() => chainable);
  });
  
  // Terminal methods that return promises
  chainable.single = vi.fn(() => Promise.resolve({ data: getData()[0] || null, error: null }));
  chainable.maybeSingle = vi.fn(() => Promise.resolve({ data: getData()[0] || null, error: null }));
  
  // Make it thenable (for await without .single()/.maybeSingle())
  chainable.then = vi.fn((resolve) => {
    const data = getData();
    return Promise.resolve().then(() => resolve({ data, error: null, count: data.length }));
  });
  
  return chainable;
};

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((tableName: string) => createChainableMock(tableName)),
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

// Suppress console errors during tests
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
