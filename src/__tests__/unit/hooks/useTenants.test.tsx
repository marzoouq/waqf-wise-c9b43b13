/**
 * اختبارات hook المستأجرين
 * Tenants Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useTenants } from '@/hooks/property/useTenants';
import { clearMockTableData, setMockTableData } from '../../utils/supabase.mock';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  };
};

const mockTenants = [
  {
    id: 'tenant-1',
    full_name: 'محمد أحمد',
    phone: '0501234567',
    national_id: '1234567890',
    status: 'نشط',
  },
];

describe('useTenants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('fetching tenants', () => {
    it('should return tenants array', () => {
      setMockTableData('tenants', mockTenants);

      const { result } = renderHook(() => useTenants(), {
        wrapper: createWrapper(),
      });

      expect(result.current.tenants).toBeDefined();
      expect(Array.isArray(result.current.tenants)).toBe(true);
    });

    it('should have loading state', () => {
      const { result } = renderHook(() => useTenants(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBeDefined();
    });
  });

  describe('mutations', () => {
    it('should have addTenant function', () => {
      const { result } = renderHook(() => useTenants(), {
        wrapper: createWrapper(),
      });

      expect(result.current.addTenant).toBeDefined();
    });

    it('should have updateTenant function', () => {
      const { result } = renderHook(() => useTenants(), {
        wrapper: createWrapper(),
      });

      expect(result.current.updateTenant).toBeDefined();
    });

    it('should have deleteTenant function', () => {
      const { result } = renderHook(() => useTenants(), {
        wrapper: createWrapper(),
      });

      expect(result.current.deleteTenant).toBeDefined();
    });
  });
});
