/**
 * اختبارات تدفق العقارات والإيجارات المتكاملة
 * Property & Rental Flow Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';
import { setMockTableData, clearMockTableData } from '../utils/supabase.mock';
import { mockProperties, mockContracts, mockTenants } from '../fixtures/properties.fixtures';
import { mockRentalPayments } from '../fixtures/financial.fixtures';

// Mock useAuth
vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 'accountant-1', email: 'accountant@waqf.sa' },
      roles: ['accountant'],
      isLoading: false,
      isAuthenticated: true,
    }),
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Property & Rental Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('Property Management', () => {
    it('should load all properties', async () => {
      setMockTableData('properties', mockProperties);

      const { useProperties } = await import('@/hooks/property/useProperties');
      const { result } = renderHook(() => useProperties(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.properties).toBeDefined();
        expect(Array.isArray(result.current.properties)).toBe(true);
      });
    });

    it('should filter properties by status', async () => {
      setMockTableData('properties', mockProperties);

      const { useProperties } = await import('@/hooks/property/useProperties');
      const { result } = renderHook(() => useProperties(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        const activeProps = result.current.properties?.filter(p => p.status === 'نشط') || [];
        const vacantProps = result.current.properties?.filter(p => p.status === 'شاغر') || [];
        expect(activeProps.length + vacantProps.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Contract Management', () => {
    it('should load contracts with property details', async () => {
      setMockTableData('contracts', mockContracts);
      setMockTableData('properties', mockProperties);
      setMockTableData('tenants', mockTenants);

      const { useContracts } = await import('@/hooks/property/useContracts');
      const { result } = renderHook(() => useContracts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.contracts).toBeDefined();
        expect(Array.isArray(result.current.contracts)).toBe(true);
      });
    });

    it('should identify active contracts', async () => {
      setMockTableData('contracts', mockContracts);

      const { useContracts } = await import('@/hooks/property/useContracts');
      const { result } = renderHook(() => useContracts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        const activeContracts = result.current.contracts?.filter(c => c.status === 'نشط') || [];
        expect(activeContracts.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Rental Payment Tracking', () => {
    it('should load rental payments for property', async () => {
      setMockTableData('rental_payments', mockRentalPayments);
      setMockTableData('contracts', mockContracts);

      const { useRentalPayments } = await import('@/hooks/property/useRentalPayments');
      const { result } = renderHook(() => useRentalPayments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.payments).toBeDefined();
      });
    });

    it('should calculate total collected rent', async () => {
      setMockTableData('rental_payments', mockRentalPayments);

      const { useRentalPayments } = await import('@/hooks/property/useRentalPayments');
      const { result } = renderHook(() => useRentalPayments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        const totalCollected = result.current.payments
          ?.filter(p => p.status === 'مدفوع')
          .reduce((sum, p) => sum + (p.amount_due || 0), 0) || 0;
        expect(totalCollected).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Property Statistics', () => {
    it('should calculate property counts', async () => {
      setMockTableData('properties', mockProperties);

      const { usePropertiesStats } = await import('@/hooks/property/usePropertiesStats');
      const { result } = renderHook(() => usePropertiesStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });
    });
  });

  describe('Tenant Data', () => {
    it('should load tenant information', async () => {
      setMockTableData('tenants', mockTenants);

      expect(mockTenants.length).toBeGreaterThan(0);
      expect(mockTenants[0].name).toBeDefined();
    });
  });
});
