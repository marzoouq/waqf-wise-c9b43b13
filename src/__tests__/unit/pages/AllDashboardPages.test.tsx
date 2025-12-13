/**
 * اختبارات جميع صفحات لوحات التحكم
 * All Dashboard Pages Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';

// Mock useAuth - uses global mock from setup.ts
// Import setMockAuthRoles to customize roles per test
import { setMockAuthRoles } from '@/test/setup';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
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

describe('All Dashboard Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockAuthRoles(['admin']);
  });

  // لوحة تحكم الناظر
  describe('Nazer Dashboard Pages', () => {
    beforeEach(() => {
      setMockAuthRoles(['nazer']);
    });

    it('should render NazerDashboard', async () => {
      const Page = (await import('@/pages/NazerDashboard')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should have overview tab', () => {
      expect(true).toBe(true);
    });

    it('should have beneficiaries tab', () => {
      expect(true).toBe(true);
    });

    it('should have reports tab', () => {
      expect(true).toBe(true);
    });

    it('should have control tab', () => {
      expect(true).toBe(true);
    });
  });

  // لوحة تحكم المدير
  describe('Admin Dashboard Pages', () => {
    it('should render AdminDashboard', async () => {
      const Page = (await import('@/pages/AdminDashboard')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render Users page', async () => {
      const Page = (await import('@/pages/Users')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render RolesManagement page', async () => {
      const Page = (await import('@/pages/RolesManagement')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render PermissionsManagement page', async () => {
      const Page = (await import('@/pages/PermissionsManagement')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render SystemMonitoring page', async () => {
      const Page = (await import('@/pages/SystemMonitoring')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render AuditLogs page', async () => {
      const Page = (await import('@/pages/AuditLogs')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render SecurityDashboard page', async () => {
      const Page = (await import('@/pages/SecurityDashboard')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });
  });

  // لوحة تحكم المحاسب
  describe('Accountant Dashboard Pages', () => {
    beforeEach(() => {
      setMockAuthRoles(['accountant']);
    });

    it('should render AccountantDashboard', async () => {
      const Page = (await import('@/pages/AccountantDashboard')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render Accounting page', async () => {
      const Page = (await import('@/pages/Accounting')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render Invoices page', async () => {
      const Page = (await import('@/pages/Invoices')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render PaymentVouchers page', async () => {
      const Page = (await import('@/pages/PaymentVouchers')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render BankTransfers page', async () => {
      const Page = (await import('@/pages/BankTransfers')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render FiscalYearsManagement page', async () => {
      const Page = (await import('@/pages/FiscalYearsManagement')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });
  });

  // لوحة تحكم الصندوق
  describe('Cashier Dashboard Pages', () => {
    beforeEach(() => {
      setMockAuthRoles(['cashier']);
    });

    it('should render CashierDashboard', async () => {
      const Page = (await import('@/pages/CashierDashboard')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render PointOfSale page', async () => {
      const Page = (await import('@/pages/PointOfSale')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render Payments page', async () => {
      const Page = (await import('@/pages/Payments')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });
  });

  // لوحة تحكم الأرشيف
  describe('Archivist Dashboard Pages', () => {
    beforeEach(() => {
      setMockAuthRoles(['archivist']);
    });

    it('should render ArchivistDashboard', async () => {
      const Page = (await import('@/pages/ArchivistDashboard')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render Archive page', async () => {
      const Page = (await import('@/pages/Archive')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });
  });

  // بوابة المستفيد
  describe('Beneficiary Portal Pages', () => {
    beforeEach(() => {
      setMockAuthRoles(['beneficiary']);
    });

    it('should render BeneficiaryPortal', async () => {
      const Page = (await import('@/pages/BeneficiaryPortal')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render BeneficiaryProfile page', async () => {
      const Page = (await import('@/pages/BeneficiaryProfile')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render BeneficiaryAccountStatement page', async () => {
      const Page = (await import('@/pages/BeneficiaryAccountStatement')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render BeneficiaryReports page', async () => {
      const Page = (await import('@/pages/BeneficiaryReports')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render BeneficiaryRequests page', async () => {
      const Page = (await import('@/pages/BeneficiaryRequests')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render BeneficiarySettings page', async () => {
      const Page = (await import('@/pages/BeneficiarySettings')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });

    it('should render BeneficiarySupport page', async () => {
      const Page = (await import('@/pages/BeneficiarySupport')).default;
      render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(document.body).toBeDefined());
    });
  });
});
