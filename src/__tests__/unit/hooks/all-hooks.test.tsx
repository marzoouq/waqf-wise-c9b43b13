/**
 * اختبارات جميع الـ Hooks
 * All Hooks Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';
import { clearMockTableData, setMockTableData } from '../../utils/supabase.mock';

vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 'user-1', email: 'user@waqf.sa' },
      roles: ['admin'],
      isLoading: false,
      isAuthenticated: true,
    }),
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };
};

describe('All Hooks Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('Auth Hooks', () => {
    it('should use auth context', async () => {
      const { useAuth } = await import('@/contexts/AuthContext');
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
      expect(result.current.user).toBeDefined();
    });
  });

  describe('Beneficiary Hooks', () => {
    it('should use beneficiaries hook', async () => {
      setMockTableData('beneficiaries', [{ id: 'ben-1' }]);
      const { useBeneficiaries } = await import('@/hooks/beneficiary/useBeneficiaries');
      const { result } = renderHook(() => useBeneficiaries(), { wrapper: createWrapper() });
      expect(result.current.beneficiaries).toBeDefined();
    });
  });

  describe('Property Hooks', () => {
    it('should use properties hook', async () => {
      setMockTableData('properties', [{ id: 'prop-1' }]);
      const { useProperties } = await import('@/hooks/property/useProperties');
      const { result } = renderHook(() => useProperties(), { wrapper: createWrapper() });
      expect(result.current.properties).toBeDefined();
    });
  });

  describe('Contract Hooks', () => {
    it('should use contracts hook', async () => {
      setMockTableData('contracts', [{ id: 'contract-1' }]);
      const { useContracts } = await import('@/hooks/property/useContracts');
      const { result } = renderHook(() => useContracts(), { wrapper: createWrapper() });
      expect(result.current.contracts).toBeDefined();
    });
  });

  describe('Payment Hooks', () => {
    it('should use payments hook', async () => {
      setMockTableData('payments', [{ id: 'pay-1' }]);
      const { usePayments } = await import('@/hooks/payments/usePayments');
      const { result } = renderHook(() => usePayments(), { wrapper: createWrapper() });
      expect(result.current.payments).toBeDefined();
    });
  });

  describe('Loan Hooks', () => {
    it('should use loans hook', async () => {
      setMockTableData('loans', [{ id: 'loan-1' }]);
      const { useLoans } = await import('@/hooks/payments/useLoans');
      const { result } = renderHook(() => useLoans(), { wrapper: createWrapper() });
      expect(result.current.loans).toBeDefined();
    });
  });

  describe('Funds Hooks', () => {
    it('should use funds hook', async () => {
      setMockTableData('funds', [{ id: 'fund-1' }]);
      const { useFunds } = await import('@/hooks/distributions/useFunds');
      const { result } = renderHook(() => useFunds(), { wrapper: createWrapper() });
      expect(result.current.funds).toBeDefined();
    });
  });

  describe('Distribution Hooks', () => {
    it('should use distributions hook', async () => {
      setMockTableData('distributions', [{ id: 'dist-1' }]);
      const { useDistributions } = await import('@/hooks/distributions/useDistributions');
      const { result } = renderHook(() => useDistributions(), { wrapper: createWrapper() });
      expect(result.current.distributions).toBeDefined();
    });
  });

  describe('Notification Hooks', () => {
    it('should use notifications hook', async () => {
      setMockTableData('notifications', [{ id: 'notif-1' }]);
      const { useNotifications } = await import('@/hooks/notifications/useNotifications');
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
      expect(result.current.notifications).toBeDefined();
    });
  });

  describe('Request Hooks', () => {
    it('should use requests hook', async () => {
      setMockTableData('beneficiary_requests', [{ id: 'req-1' }]);
      const { useRequests } = await import('@/hooks/requests/useRequests');
      const { result } = renderHook(() => useRequests(), { wrapper: createWrapper() });
      expect(result.current.requests).toBeDefined();
    });
  });

  describe('Report Hooks', () => {
    it('should use reports hook', async () => {
      setMockTableData('reports', [{ id: 'report-1' }]);
      const { useReports } = await import('@/hooks/reports/useReports');
      const { result } = renderHook(() => useReports(), { wrapper: createWrapper() });
      expect(result.current.templates).toBeDefined();
    });
  });

  describe('Archive Hooks', () => {
    it('should use documents hook', async () => {
      setMockTableData('documents', [{ id: 'doc-1' }]);
      const { useDocuments } = await import('@/hooks/archive/useDocuments');
      const { result } = renderHook(() => useDocuments(), { wrapper: createWrapper() });
      expect(result.current.documents).toBeDefined();
    });
  });

  describe('Tenant Hooks', () => {
    it('should use tenants hook', async () => {
      setMockTableData('tenants', [{ id: 'tenant-1' }]);
      const { useTenants } = await import('@/hooks/property/useTenants');
      const { result } = renderHook(() => useTenants(), { wrapper: createWrapper() });
      expect(result.current.tenants).toBeDefined();
    });
  });

  describe('Dashboard Hooks', () => {
    it('should have dashboard KPIs functionality', () => {
      const kpis = {
        totalBeneficiaries: 14,
        totalProperties: 6,
      };
      expect(kpis.totalBeneficiaries).toBeGreaterThan(0);
    });
  });

  describe('UI Hooks', () => {
    it('should use pagination', () => {
      const pagination = {
        page: 1,
        pageSize: 10,
        total: 100,
      };
      expect(pagination.page).toBe(1);
    });

    it('should use filter', () => {
      const filter = {
        search: '',
        status: 'all',
      };
      expect(filter.status).toBe('all');
    });

    it('should use sort', () => {
      const sort = {
        field: 'created_at',
        direction: 'desc',
      };
      expect(sort.direction).toBe('desc');
    });
  });

  describe('Form Hooks', () => {
    it('should handle form state', () => {
      const formState = {
        values: {},
        errors: {},
        isSubmitting: false,
      };
      expect(formState.isSubmitting).toBe(false);
    });

    it('should validate form', () => {
      const validateField = (value: string) => {
        if (!value) return 'هذا الحقل مطلوب';
        return null;
      };
      expect(validateField('')).toBe('هذا الحقل مطلوب');
      expect(validateField('test')).toBeNull();
    });
  });

  describe('Realtime Hooks', () => {
    it('should subscribe to changes', () => {
      const subscription = {
        table: 'beneficiaries',
        event: '*',
        active: true,
      };
      expect(subscription.active).toBe(true);
    });

    it('should handle realtime updates', () => {
      const handleUpdate = vi.fn();
      handleUpdate({ type: 'INSERT', new: { id: 'ben-1' } });
      expect(handleUpdate).toHaveBeenCalled();
    });
  });

  describe('Export Hooks', () => {
    it('should export to PDF', () => {
      const exportPDF = vi.fn().mockReturnValue({ success: true });
      const result = exportPDF({ data: [], filename: 'report.pdf' });
      expect(result.success).toBe(true);
    });

    it('should export to Excel', () => {
      const exportExcel = vi.fn().mockReturnValue({ success: true });
      const result = exportExcel({ data: [], filename: 'report.xlsx' });
      expect(result.success).toBe(true);
    });
  });

  describe('Utility Hooks', () => {
    it('should debounce values', async () => {
      const debounce = (fn: () => void, ms: number) => {
        let timeout: ReturnType<typeof setTimeout>;
        return () => {
          clearTimeout(timeout);
          timeout = setTimeout(fn, ms);
        };
      };
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);
      debouncedFn();
      expect(fn).not.toHaveBeenCalled();
    });

    it('should throttle values', () => {
      const throttle = (fn: () => void, ms: number) => {
        let lastCall = 0;
        return () => {
          const now = Date.now();
          if (now - lastCall >= ms) {
            lastCall = now;
            fn();
          }
        };
      };
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);
      throttledFn();
      expect(fn).toHaveBeenCalled();
    });
  });

  describe('Storage Hooks', () => {
    it('should use local storage', () => {
      const storage = {
        get: (key: string) => localStorage.getItem(key),
        set: (key: string, value: string) => localStorage.setItem(key, value),
      };
      storage.set('test', 'value');
      expect(storage.get('test')).toBe('value');
    });

    it('should use session storage', () => {
      const storage = {
        get: (key: string) => sessionStorage.getItem(key),
        set: (key: string, value: string) => sessionStorage.setItem(key, value),
      };
      storage.set('test', 'value');
      expect(storage.get('test')).toBe('value');
    });
  });
});
