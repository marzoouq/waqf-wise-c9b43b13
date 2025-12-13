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
  });

  describe('Nazer Dashboard Pages', () => {
    it('should render NazerDashboard', async () => {
      const Page = (await import('@/pages/NazerDashboard')).default;
      const { container } = render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(container.firstChild).toBeTruthy());
    });
  });

  describe('Admin Dashboard Pages', () => {
    it('should render AdminDashboard', async () => {
      const Page = (await import('@/pages/AdminDashboard')).default;
      const { container } = render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(container.firstChild).toBeTruthy());
    });

    it('should render Users page', async () => {
      const Page = (await import('@/pages/Users')).default;
      const { container } = render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(container.firstChild).toBeTruthy());
    });

    it('should render SystemMonitoring page', async () => {
      const Page = (await import('@/pages/SystemMonitoring')).default;
      const { container } = render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(container.firstChild).toBeTruthy());
    });
  });

  describe('Accountant Dashboard Pages', () => {
    it('should render AccountantDashboard', async () => {
      const Page = (await import('@/pages/AccountantDashboard')).default;
      const { container } = render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(container.firstChild).toBeTruthy());
    });

    it('should render Accounting page', async () => {
      const Page = (await import('@/pages/Accounting')).default;
      const { container } = render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(container.firstChild).toBeTruthy());
    });
  });

  describe('Cashier Dashboard Pages', () => {
    it('should render CashierDashboard', async () => {
      const Page = (await import('@/pages/CashierDashboard')).default;
      const { container } = render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(container.firstChild).toBeTruthy());
    });
  });

  describe('Archivist Dashboard Pages', () => {
    it('should render ArchivistDashboard', async () => {
      const Page = (await import('@/pages/ArchivistDashboard')).default;
      const { container } = render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(container.firstChild).toBeTruthy());
    });

    it('should render Archive page', async () => {
      const Page = (await import('@/pages/Archive')).default;
      const { container } = render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(container.firstChild).toBeTruthy());
    });
  });

  describe('Beneficiary Portal Pages', () => {
    it('should render BeneficiaryPortal', async () => {
      const Page = (await import('@/pages/BeneficiaryPortal')).default;
      const { container } = render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(container.firstChild).toBeTruthy());
    });

    it('should render BeneficiaryProfile page', async () => {
      const Page = (await import('@/pages/BeneficiaryProfile')).default;
      const { container } = render(<Page />, { wrapper: createWrapper() });
      await waitFor(() => expect(container.firstChild).toBeTruthy());
    });
  });
});
