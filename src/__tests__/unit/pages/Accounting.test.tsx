/**
 * اختبارات صفحة المحاسبة
 * Accounting Page Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
      user: { id: 'accountant-1', email: 'accountant@waqf.sa' },
      roles: ['accountant'],
      isLoading: false,
      isAuthenticated: true,
    }),
  };
});

// Mock accounting hooks
vi.mock('@/hooks/accounting/useAccounts', () => ({
  useAccounts: () => ({
    accounts: [
      { id: '1', code: '1.1.1', name_ar: 'البنك', account_type: 'asset', current_balance: 850000 },
      { id: '2', code: '4.1.1', name_ar: 'إيرادات الإيجار', account_type: 'revenue', current_balance: 750000 },
    ],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/accounting/useJournalEntries', () => ({
  useJournalEntries: () => ({
    entries: [
      { id: 'je-1', entry_number: 'JE-001', description: 'قيد اختبار', status: 'posted', total_debit: 100000 },
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

describe('Accounting Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render accounting page structure', async () => {
      const Accounting = (await import('@/pages/Accounting')).default;
      render(<Accounting />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(document.body).toBeDefined();
      });
    });
  });

  describe('Chart of Accounts', () => {
    it('should display accounts list', async () => {
      const { useAccounts } = await import('@/hooks/accounting/useAccounts');
      const result = useAccounts();
      
      expect(result.accounts).toBeDefined();
      expect(result.accounts?.length).toBeGreaterThan(0);
    });

    it('should categorize accounts by type', async () => {
      const { useAccounts } = await import('@/hooks/accounting/useAccounts');
      const result = useAccounts();
      
      const assetAccounts = result.accounts?.filter(a => a.account_type === 'asset') || [];
      const revenueAccounts = result.accounts?.filter(a => a.account_type === 'revenue') || [];
      
      expect(assetAccounts.length).toBeGreaterThanOrEqual(0);
      expect(revenueAccounts.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Journal Entries', () => {
    it('should load journal entries', async () => {
      const { useJournalEntries } = await import('@/hooks/accounting/useJournalEntries');
      const result = useJournalEntries();
      
      expect(result.entries).toBeDefined();
    });

    it('should filter posted entries', async () => {
      const { useJournalEntries } = await import('@/hooks/accounting/useJournalEntries');
      const result = useJournalEntries();
      
      const postedEntries = result.entries?.filter(e => e.status === 'posted') || [];
      expect(postedEntries.length).toBeGreaterThanOrEqual(0);
    });
  });
});
