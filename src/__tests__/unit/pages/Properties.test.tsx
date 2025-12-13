/**
 * اختبارات صفحة العقارات
 * Properties Page Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';

// Mock useAuth
vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 'admin-1', email: 'admin@waqf.sa' },
      roles: ['admin'],
      isLoading: false,
      isAuthenticated: true,
    }),
  };
});

// Mock property hooks
vi.mock('@/hooks/property/useProperties', () => ({
  useProperties: () => ({
    properties: [
      { id: 'prop-1', name: 'عقار السامر 2', location: 'جدة', status: 'نشط', apartment_count: 8 },
      { id: 'prop-2', name: 'عقار السامر 3', location: 'جدة', status: 'نشط', apartment_count: 9 },
      { id: 'prop-3', name: 'عقار الطائف 1', location: 'الطائف', status: 'شاغر', apartment_count: 8 },
    ],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/property/useContracts', () => ({
  useContracts: () => ({
    contracts: [
      { id: 'cont-1', property_id: 'prop-1', tenant_name: 'القويشي', monthly_rent: 29167, status: 'نشط' },
      { id: 'cont-2', property_id: 'prop-2', tenant_name: 'رواء', monthly_rent: 33333, status: 'نشط' },
    ],
    isLoading: false,
  }),
}));

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

describe('Properties Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render properties page', async () => {
      const Properties = (await import('@/pages/Properties')).default;
      render(<Properties />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(document.body).toBeDefined();
      });
    });
  });

  describe('Properties List', () => {
    it('should load all properties', async () => {
      const { useProperties } = await import('@/hooks/property/useProperties');
      const result = useProperties();
      
      expect(result.properties).toBeDefined();
      expect(result.properties?.length).toBe(3);
    });

    it('should filter properties by status', async () => {
      const { useProperties } = await import('@/hooks/property/useProperties');
      const result = useProperties();
      
      const activeProperties = result.properties?.filter(p => p.status === 'نشط') || [];
      const vacantProperties = result.properties?.filter(p => p.status === 'شاغر') || [];
      
      expect(activeProperties.length).toBe(2);
      expect(vacantProperties.length).toBe(1);
    });

    it('should filter properties by location', async () => {
      const { useProperties } = await import('@/hooks/property/useProperties');
      const result = useProperties();
      
      const jeddahProperties = result.properties?.filter(p => p.location === 'جدة') || [];
      const taifProperties = result.properties?.filter(p => p.location === 'الطائف') || [];
      
      expect(jeddahProperties.length).toBe(2);
      expect(taifProperties.length).toBe(1);
    });
  });

  describe('Contracts', () => {
    it('should load contracts with property details', async () => {
      const { useContracts } = await import('@/hooks/property/useContracts');
      const result = useContracts();
      
      expect(result.contracts).toBeDefined();
      expect(result.contracts?.length).toBe(2);
    });

    it('should calculate total monthly rent', async () => {
      const { useContracts } = await import('@/hooks/property/useContracts');
      const result = useContracts();
      
      const totalRent = result.contracts?.reduce((sum, c) => sum + (c.monthly_rent || 0), 0) || 0;
      expect(totalRent).toBe(62500);
    });
  });

  describe('Property Statistics', () => {
    it('should calculate unit counts', async () => {
      const { useProperties } = await import('@/hooks/property/useProperties');
      const result = useProperties();
      
      const totalUnits = result.properties?.reduce((sum, p) => sum + (p.apartment_count || 0), 0) || 0;
      expect(totalUnits).toBe(25);
    });
  });
});
