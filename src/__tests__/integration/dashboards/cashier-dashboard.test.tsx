/**
 * اختبارات لوحة تحكم أمين الصندوق
 * CashierDashboard Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CashierDashboard from '@/pages/CashierDashboard';
import { AuthProvider } from '@/contexts/AuthContext';
import { cashierUser } from '../../fixtures/users.fixtures';

// Mock hooks
vi.mock('@/hooks/dashboard', () => ({
  useCashierStats: vi.fn(() => ({
    data: {
      cashBalance: 125000,
      todayReceipts: 45000,
      todayPayments: 22000,
      pendingTransactions: 5,
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
  useCashierDashboardRealtime: vi.fn(),
  useCashierDashboardRefresh: vi.fn(() => ({ refreshAll: vi.fn() })),
}));

vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(() => ({
      user: { id: cashierUser.id, email: cashierUser.email },
      profile: { full_name: cashierUser.profile.full_name },
      roles: cashierUser.roles,
      isAuthenticated: true,
      isLoading: false,
    })),
  };
});

// Mock components
vi.mock('@/components/dashboard/RecentJournalEntries', () => ({
  default: () => (
    <div data-testid="recent-entries">
      <div>قيد #1 - سند قبض - 5000 ريال</div>
      <div>قيد #2 - سند صرف - 3000 ريال</div>
    </div>
  ),
}));

vi.mock('@/components/payments/AddReceiptDialog', () => ({
  AddReceiptDialog: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
    open ? <div data-testid="receipt-dialog">حوار سند القبض</div> : null
  ),
}));

vi.mock('@/components/payments/AddVoucherDialog', () => ({
  AddVoucherDialog: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
    open ? <div data-testid="voucher-dialog">حوار سند الصرف</div> : null
  ),
}));

vi.mock('@/components/dashboard/shared', () => ({
  FinancialCardsRow: ({ className }: { className?: string }) => (
    <div data-testid="financial-cards" className={className}>
      <div data-testid="bank-balance">رصيد البنك: 500,000 ريال</div>
    </div>
  ),
}));

vi.mock('@/components/nazer/LastSyncIndicator', () => ({
  LastSyncIndicator: ({ onRefresh }: { onRefresh?: () => void }) => (
    <div data-testid="last-sync">آخر تحديث</div>
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CashierDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('التحميل والعرض الأساسي', () => {
    it('يعرض لوحة تحكم أمين الصندوق بنجاح', async () => {
      render(<CashierDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('رصيد الصندوق')).toBeInTheDocument();
      });
    });

    it('يعرض بطاقات KPIs الأربع', async () => {
      render(<CashierDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('رصيد الصندوق')).toBeInTheDocument();
        expect(screen.getByText('مقبوضات اليوم')).toBeInTheDocument();
        expect(screen.getByText('مدفوعات اليوم')).toBeInTheDocument();
        expect(screen.getByText('معاملات معلقة')).toBeInTheDocument();
      });
    });

    it('يعرض القيم الصحيحة', async () => {
      render(<CashierDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/125,000/)).toBeInTheDocument(); // رصيد الصندوق
        expect(screen.getByText(/45,000/)).toBeInTheDocument(); // مقبوضات اليوم
        expect(screen.getByText(/22,000/)).toBeInTheDocument(); // مدفوعات اليوم
        expect(screen.getByText('5')).toBeInTheDocument(); // معاملات معلقة
      });
    });
  });

  describe('التبويبات', () => {
    it('يعرض تبويب نظرة عامة افتراضياً', async () => {
      render(<CashierDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /نظرة عامة/i })).toHaveAttribute('data-state', 'active');
      });
    });

    it('يعرض ملخص اليوم في تبويب نظرة عامة', async () => {
      render(<CashierDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('ملخص اليوم')).toBeInTheDocument();
        expect(screen.getByText('إجمالي المقبوضات')).toBeInTheDocument();
        expect(screen.getByText('إجمالي المدفوعات')).toBeInTheDocument();
        expect(screen.getByText('الصافي')).toBeInTheDocument();
      });
    });

    it('يمكن التبديل إلى تبويب الإجراءات السريعة', async () => {
      const user = userEvent.setup();
      render(<CashierDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /إجراءات سريعة/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('tab', { name: /إجراءات سريعة/i }));

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /إجراءات سريعة/i })).toHaveAttribute('data-state', 'active');
      });
    });

    it('يمكن التبديل إلى تبويب العمليات الأخيرة', async () => {
      const user = userEvent.setup();
      render(<CashierDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /العمليات الأخيرة/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('tab', { name: /العمليات الأخيرة/i }));

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /العمليات الأخيرة/i })).toHaveAttribute('data-state', 'active');
      });
    });
  });

  describe('الإجراءات السريعة', () => {
    it('يعرض أزرار سند القبض والصرف', async () => {
      const user = userEvent.setup();
      render(<CashierDashboard />, { wrapper: createWrapper() });

      await user.click(screen.getByRole('tab', { name: /إجراءات سريعة/i }));

      await waitFor(() => {
        expect(screen.getByText('إضافة سند قبض')).toBeInTheDocument();
        expect(screen.getByText('إضافة سند صرف')).toBeInTheDocument();
      });
    });

    it('يفتح حوار سند القبض', async () => {
      const user = userEvent.setup();
      render(<CashierDashboard />, { wrapper: createWrapper() });

      await user.click(screen.getByRole('tab', { name: /إجراءات سريعة/i }));

      await waitFor(() => {
        expect(screen.getByText('إضافة سند قبض')).toBeInTheDocument();
      });

      // النقر على البطاقة أو الزر
      const receiptCard = screen.getByText('إضافة سند قبض').closest('div[class*="Card"]');
      if (receiptCard) {
        await user.click(receiptCard);
      }

      await waitFor(() => {
        expect(screen.getByTestId('receipt-dialog')).toBeInTheDocument();
      });
    });

    it('يفتح حوار سند الصرف', async () => {
      const user = userEvent.setup();
      render(<CashierDashboard />, { wrapper: createWrapper() });

      await user.click(screen.getByRole('tab', { name: /إجراءات سريعة/i }));

      await waitFor(() => {
        expect(screen.getByText('إضافة سند صرف')).toBeInTheDocument();
      });

      // النقر على البطاقة
      const voucherCard = screen.getByText('إضافة سند صرف').closest('div[class*="Card"]');
      if (voucherCard) {
        await user.click(voucherCard);
      }

      await waitFor(() => {
        expect(screen.getByTestId('voucher-dialog')).toBeInTheDocument();
      });
    });
  });

  describe('ملخص اليوم', () => {
    it('يحسب الصافي بشكل صحيح (مقبوضات - مدفوعات)', async () => {
      render(<CashierDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        // الصافي = 45000 - 22000 = 23000
        expect(screen.getByText(/23,000/)).toBeInTheDocument();
      });
    });

    it('يعرض المقبوضات باللون الأخضر', async () => {
      render(<CashierDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        const receiptsValue = screen.getByText(/\+45,000/);
        expect(receiptsValue).toHaveClass('text-success');
      });
    });

    it('يعرض المدفوعات باللون الأحمر', async () => {
      render(<CashierDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        const paymentsValue = screen.getByText(/-22,000/);
        expect(paymentsValue).toHaveClass('text-destructive');
      });
    });
  });

  describe('العمليات الأخيرة', () => {
    it('يعرض القيود الأخيرة', async () => {
      const user = userEvent.setup();
      render(<CashierDashboard />, { wrapper: createWrapper() });

      await user.click(screen.getByRole('tab', { name: /العمليات الأخيرة/i }));

      await waitFor(() => {
        expect(screen.getByTestId('recent-entries')).toBeInTheDocument();
      });
    });
  });

  describe('البطاقات المالية', () => {
    it('يعرض صف البطاقات المالية', async () => {
      render(<CashierDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('financial-cards')).toBeInTheDocument();
      });
    });
  });

  describe('حالات الخطأ والتحميل', () => {
    it('يعرض حالة التحميل', async () => {
      const { useCashierStats } = await import('@/hooks/dashboard');
      vi.mocked(useCashierStats).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<CashierDashboard />, { wrapper: createWrapper() });

      expect(screen.getByText(/جاري تحميل/i)).toBeInTheDocument();
    });
  });
});
