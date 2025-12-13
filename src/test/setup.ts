import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { 
  mockSupabase, 
  clearMockTableData, 
  setMockTableData 
} from '@/__tests__/utils/supabase.mock';

// Make vi globally available
globalThis.vi = vi;

// Re-export mock utilities for tests
export { setMockTableData, clearMockTableData };

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Reset mock data before each test
beforeEach(() => {
  clearMockTableData();
  vi.clearAllMocks();
});

// Mock Supabase client using the centralized mock
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
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
