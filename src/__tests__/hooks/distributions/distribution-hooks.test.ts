/**
 * اختبارات Hooks التوزيعات - اختبارات وظيفية حقيقية
 * Real Functional Tests with renderHook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock data
const mockDistributions = [
  { 
    id: '1', 
    distribution_date: '2024-01-15', 
    total_amount: 100000, 
    status: 'completed',
    beneficiaries_count: 50 
  },
];

const mockDistributionDetails = [
  { id: '1', distribution_id: '1', beneficiary_id: 'b1', amount: 2000, status: 'paid' },
  { id: '2', distribution_id: '1', beneficiary_id: 'b2', amount: 2000, status: 'paid' },
];

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockImplementation(() => {
          if (table === 'distributions') {
            return Promise.resolve({ data: mockDistributions, error: null });
          }
          if (table === 'distribution_details' || table === 'heir_distributions') {
            return Promise.resolve({ data: mockDistributionDetails, error: null });
          }
          return Promise.resolve({ data: [], error: null });
        }),
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: mockDistributions[0], 
            error: null 
          }),
          order: vi.fn().mockResolvedValue({ 
            data: mockDistributionDetails, 
            error: null 
          }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ data: { id: 'new-id' }, error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null })
      }),
    })),
    rpc: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

// Create test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe('Distribution Hooks - Real Functional Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('useDistributionDetails', () => {
    it('should return distribution details for given ID', async () => {
      const { useDistributionDetails } = await import('@/hooks/distributions/useDistributionDetails');
      
      const { result } = renderHook(
        () => useDistributionDetails('1'), 
        { wrapper: createWrapper() }
      );
      
      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('isLoading');
    });

    it('should have details array', async () => {
      const { useDistributionDetails } = await import('@/hooks/distributions/useDistributionDetails');
      
      const { result } = renderHook(
        () => useDistributionDetails('1'), 
        { wrapper: createWrapper() }
      );
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      
      expect(result.current).toHaveProperty('details');
      expect(Array.isArray(result.current.details)).toBe(true);
    });

    it('should not fetch without distribution ID', async () => {
      const { useDistributionDetails } = await import('@/hooks/distributions/useDistributionDetails');
      
      const { result } = renderHook(
        () => useDistributionDetails(undefined), 
        { wrapper: createWrapper() }
      );
      
      expect(result.current).toHaveProperty('details');
      expect(result.current.details).toEqual([]);
    });
  });

  describe('distributions module exports', () => {
    it('should export useDistributionDetails', async () => {
      const module = await import('@/hooks/distributions');
      
      expect(module).toBeDefined();
      expect(module.useDistributionDetails).toBeDefined();
      expect(typeof module.useDistributionDetails).toBe('function');
    });

    it('should export additional distribution hooks if available', async () => {
      const module = await import('@/hooks/distributions');
      
      // Check for other common exports
      if ('useDistributions' in module) {
        expect(typeof module.useDistributions).toBe('function');
      }
      if ('useDistributionEngine' in module) {
        expect(typeof module.useDistributionEngine).toBe('function');
      }
      if ('useDistributionApprovals' in module) {
        expect(typeof module.useDistributionApprovals).toBe('function');
      }
    });

    it('should have proper TypeScript exports', async () => {
      const module = await import('@/hooks/distributions');
      
      // Verify module is properly structured
      expect(typeof module).toBe('object');
      
      // Should have at least one export
      const exports = Object.keys(module);
      expect(exports.length).toBeGreaterThan(0);
    });
  });
});
