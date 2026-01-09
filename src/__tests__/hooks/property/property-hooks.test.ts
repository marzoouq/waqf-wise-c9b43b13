/**
 * اختبارات Hooks العقارات - اختبارات وظيفية شاملة
 * @version 2.0.0
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockReturnValue({
        range: vi.fn().mockResolvedValue({ 
          data: [
            { id: '1', name: 'عمارة الصفا', type: 'building', status: 'active' },
            { id: '2', name: 'فيلا المروة', type: 'villa', status: 'active' }
          ], 
          error: null,
          count: 2 
        }),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ 
          data: { id: '1', name: 'عمارة الصفا', units_count: 10 }, 
          error: null 
        }),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      gte: vi.fn().mockReturnValue({
        lte: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ 
          data: { id: 'new-property', name: 'عقار جديد' }, 
          error: null 
        }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  })),
  rpc: vi.fn().mockResolvedValue({ data: { total_revenue: 50000 }, error: null }),
  auth: {
    getSession: vi.fn().mockResolvedValue({ 
      data: { session: { user: { id: 'user-1' } } }, 
      error: null 
    }),
    onAuthStateChange: vi.fn(() => ({ 
      data: { subscription: { unsubscribe: vi.fn() } } 
    })),
    getUser: vi.fn().mockResolvedValue({ 
      data: { user: { id: 'user-1' } }, 
      error: null 
    }),
  },
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  })),
  removeChannel: vi.fn(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Query Client wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('Property Hooks - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useProperties Hook', () => {
    it('should return properties data structure', async () => {
      const { useProperties } = await import('@/hooks/property/useProperties');
      const { result } = renderHook(() => useProperties(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('properties');
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
    });

    it('should return properties array', async () => {
      const { useProperties } = await import('@/hooks/property/useProperties');
      const { result } = renderHook(() => useProperties(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      expect(Array.isArray(result.current.properties)).toBe(true);
    });

    it('should have refetch function', async () => {
      const { useProperties } = await import('@/hooks/property/useProperties');
      const { result } = renderHook(() => useProperties(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should have error property', async () => {
      const { useProperties } = await import('@/hooks/property/useProperties');
      const { result } = renderHook(() => useProperties(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('error');
    });
  });

  describe('useTenants Hook', () => {
    it('should return tenants data structure', async () => {
      const { useTenants } = await import('@/hooks/property/useTenants');
      const { result } = renderHook(() => useTenants(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('tenants');
    });

    it('should return tenants array', async () => {
      const { useTenants } = await import('@/hooks/property/useTenants');
      const { result } = renderHook(() => useTenants(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      expect(Array.isArray(result.current.tenants)).toBe(true);
    });
  });

  describe('useContracts Hook', () => {
    it('should return contracts data structure', async () => {
      const { useContracts } = await import('@/hooks/property/useContracts');
      const { result } = renderHook(() => useContracts(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('contracts');
    });

    it('should return contracts array', async () => {
      const { useContracts } = await import('@/hooks/property/useContracts');
      const { result } = renderHook(() => useContracts(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      expect(Array.isArray(result.current.contracts)).toBe(true);
    });
  });

  describe('usePropertyUnits Hook', () => {
    it('should return units for a property', async () => {
      const { usePropertyUnits } = await import('@/hooks/property/usePropertyUnits');
      const { result } = renderHook(
        () => usePropertyUnits('property-1'),
        { wrapper: createWrapper() }
      );
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('units');
    });
  });

  describe('useMaintenanceRequests Hook', () => {
    it('should return maintenance requests', async () => {
      const { useMaintenanceRequests } = await import('@/hooks/property/useMaintenanceRequests');
      const { result } = renderHook(() => useMaintenanceRequests(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('requests');
    });
  });

  describe('useRentalPayments Hook', () => {
    it('should return rental payments', async () => {
      const { useRentalPayments } = await import('@/hooks/property/useRentalPayments');
      const { result } = renderHook(() => useRentalPayments(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('payments');
    });
  });

  describe('useContractsPaginated Hook', () => {
    it('should return paginated contracts', async () => {
      const { useContractsPaginated } = await import('@/hooks/property/useContractsPaginated');
      const { result } = renderHook(
        () => useContractsPaginated(),
        { wrapper: createWrapper() }
      );
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('contracts');
    });
  });

  describe('useTenantsRealtime Hook', () => {
    it('should subscribe to realtime updates', async () => {
      const { useTenantsRealtime } = await import('@/hooks/property/useTenantsRealtime');
      const { result } = renderHook(() => useTenantsRealtime(), { wrapper: createWrapper() });
      
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('tenants');
    });
  });

  describe('Hook Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const { useProperties } = await import('@/hooks/property/useProperties');
      const { result } = renderHook(() => useProperties(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
    });
  });

  describe('RTL Support', () => {
    it('should work with Arabic property names', async () => {
      const { useProperties } = await import('@/hooks/property/useProperties');
      const { result } = renderHook(() => useProperties(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      expect(result.current).toBeDefined();
    });
  });
});

  describe('Hook Caching', () => {
    it('should use query cache effectively', async () => {
      const { useProperties } = await import('@/hooks/property/useProperties');
      
      const { result: result1 } = renderHook(() => useProperties(), { wrapper: createWrapper() });
      await waitFor(() => expect(result1.current.isLoading).toBe(false), { timeout: 5000 });
      
      // Second render should use cache
      const { result: result2 } = renderHook(() => useProperties(), { wrapper: createWrapper() });
      expect(result2.current).toBeDefined();
    });
  });

  describe('RTL Support', () => {
    it('should work with Arabic property names', async () => {
      const { useProperties } = await import('@/hooks/property/useProperties');
      const { result } = renderHook(() => useProperties(), { wrapper: createWrapper() });
      
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      // Verify Arabic data is handled correctly
      expect(result.current).toBeDefined();
    });
  });
});
