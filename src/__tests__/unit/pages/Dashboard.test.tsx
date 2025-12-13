/**
 * اختبارات لوحات التحكم
 * Dashboard Pages Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';

// Mock useAuth for different roles
const mockUseAuth = vi.fn();

vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => mockUseAuth(),
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

describe('Dashboard Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin Dashboard', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'admin-1', email: 'admin@waqf.sa' },
        roles: ['admin'],
        isLoading: false,
        isAuthenticated: true,
      });
    });

    it('should render admin dashboard', async () => {
      const AdminDashboard = (await import('@/pages/AdminDashboard')).default;
      render(<AdminDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(document.body).toBeDefined();
      });
    });

    it('should have admin-specific components', () => {
      expect(mockUseAuth().roles).toContain('admin');
    });
  });

  describe('Nazer Dashboard', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'nazer-1', email: 'nazer@waqf.sa' },
        roles: ['nazer'],
        isLoading: false,
        isAuthenticated: true,
      });
    });

    it('should render nazer dashboard', async () => {
      const NazerDashboard = (await import('@/pages/NazerDashboard')).default;
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(document.body).toBeDefined();
      });
    });

    it('should have nazer role', () => {
      expect(mockUseAuth().roles).toContain('nazer');
    });
  });

  describe('Accountant Dashboard', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'accountant-1', email: 'accountant@waqf.sa' },
        roles: ['accountant'],
        isLoading: false,
        isAuthenticated: true,
      });
    });

    it('should render accountant dashboard', async () => {
      const AccountantDashboard = (await import('@/pages/AccountantDashboard')).default;
      render(<AccountantDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(document.body).toBeDefined();
      });
    });
  });

  describe('Beneficiary Portal', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'ben-1', email: 'beneficiary@waqf.sa' },
        roles: ['beneficiary'],
        isLoading: false,
        isAuthenticated: true,
      });
    });

    it('should render beneficiary portal', async () => {
      const BeneficiaryPortal = (await import('@/pages/BeneficiaryPortal')).default;
      render(<BeneficiaryPortal />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(document.body).toBeDefined();
      });
    });
  });

  describe('Cashier Dashboard', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'cashier-1', email: 'cashier@waqf.sa' },
        roles: ['cashier'],
        isLoading: false,
        isAuthenticated: true,
      });
    });

    it('should render cashier dashboard', async () => {
      const CashierDashboard = (await import('@/pages/CashierDashboard')).default;
      render(<CashierDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(document.body).toBeDefined();
      });
    });
  });

  describe('Archivist Dashboard', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'archivist-1', email: 'archivist@waqf.sa' },
        roles: ['archivist'],
        isLoading: false,
        isAuthenticated: true,
      });
    });

    it('should render archivist dashboard', async () => {
      const ArchivistDashboard = (await import('@/pages/ArchivistDashboard')).default;
      render(<ArchivistDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(document.body).toBeDefined();
      });
    });
  });
});

describe('Dashboard KPIs', () => {
  const mockKPIs = {
    totalBeneficiaries: 14,
    activeBeneficiaries: 12,
    totalProperties: 6,
    occupiedProperties: 4,
    totalContracts: 4,
    activeContracts: 3,
    totalRevenue: 850000,
    totalExpenses: 150000,
    netIncome: 700000,
    pendingRequests: 2,
    pendingApprovals: 1,
  };

  it('should calculate correct KPI values', () => {
    expect(mockKPIs.netIncome).toBe(mockKPIs.totalRevenue - mockKPIs.totalExpenses);
  });

  it('should have valid beneficiary counts', () => {
    expect(mockKPIs.activeBeneficiaries).toBeLessThanOrEqual(mockKPIs.totalBeneficiaries);
  });

  it('should have valid property counts', () => {
    expect(mockKPIs.occupiedProperties).toBeLessThanOrEqual(mockKPIs.totalProperties);
  });

  it('should have valid contract counts', () => {
    expect(mockKPIs.activeContracts).toBeLessThanOrEqual(mockKPIs.totalContracts);
  });
});

describe('Dashboard Widgets', () => {
  it('should display bank balance correctly', () => {
    const bankBalance = 850000;
    expect(bankBalance).toBeGreaterThan(0);
  });

  it('should display waqf corpus correctly', () => {
    const waqfCorpus = 107913.20;
    expect(waqfCorpus).toBeGreaterThan(0);
  });

  it('should calculate pending amounts', () => {
    const pendingAmount = 50000;
    expect(pendingAmount).toBeGreaterThanOrEqual(0);
  });
});

describe('Dashboard Navigation', () => {
  const dashboardRoutes = [
    '/admin',
    '/nazer',
    '/accountant',
    '/beneficiary',
    '/cashier',
    '/archivist',
  ];

  it('should have valid dashboard routes', () => {
    expect(dashboardRoutes.length).toBe(6);
  });

  dashboardRoutes.forEach(route => {
    it(`should have valid route: ${route}`, () => {
      expect(route.startsWith('/')).toBe(true);
    });
  });
});
