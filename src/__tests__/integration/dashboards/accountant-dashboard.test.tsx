/**
 * اختبارات لوحة تحكم المحاسب
 * AccountantDashboard Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AccountantDashboard from '@/pages/AccountantDashboard';
import { AuthProvider } from '@/contexts/AuthContext';
import { accountantUser } from '../../fixtures/users.fixtures';

// Mock hooks
vi.mock('@/hooks/dashboard/useAccountantDashboardRealtime', () => ({
  useAccountantDashboardRealtime: vi.fn(),
  useAccountantDashboardRefresh: vi.fn(() => ({ refreshAll: vi.fn() })),
}));

vi.mock('@/hooks/dashboard/useUnifiedKPIs', () => ({
  useUnifiedKPIs: vi.fn(() => ({
    data: {
      pendingApprovals: 12,
      draftJournalEntries: 8,
      postedJournalEntries: 245,
      todayJournalEntries: 5,
      totalJournalEntries: 253,
      cancelledJournalEntries: 3,
    },
    isLoading: false,
  })),
}));

vi.mock('@/hooks/accounting', () => ({
  useAccountantDashboardData: vi.fn(() => ({
    pendingApprovals: [
      { id: '1', journal_entry_id: 'je-1', status: 'pending', created_at: new Date().toISOString() },
      { id: '2', journal_entry_id: 'je-2', status: 'pending', created_at: new Date().toISOString() },
    ],
    isLoading: false,
    error: null,
  })),
}));

vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(() => ({
      user: { id: accountantUser.id, email: accountantUser.email },
      profile: { full_name: accountantUser.fullName },
      roles: accountantUser.roles,
      isAuthenticated: true,
      isLoading: false,
    })),
  };
});

// Mock components
vi.mock('@/components/dashboard/AccountingStats', () => ({
  default: () => (
    <div data-testid="accounting-stats">
      <span data-testid="total-accounts">150 حساب</span>
      <span data-testid="total-entries">253 قيد</span>
    </div>
  ),
}));

vi.mock('@/components/dashboard/RecentJournalEntries', () => ({
  default: () => (
    <div data-testid="recent-entries">
      <div data-testid="entry-1">قيد #1 - 5000 ريال</div>
      <div data-testid="entry-2">قيد #2 - 3500 ريال</div>
    </div>
  ),
}));

vi.mock('@/components/dashboard/accountant/PendingApprovalsList', () => ({
  PendingApprovalsList: ({ approvals, onReview }: { approvals: any[]; onReview: (a: any) => void }) => (
    <div data-testid="pending-approvals-list">
      {approvals.map((a: any) => (
        <button key={a.id} onClick={() => onReview(a)} data-testid={`approval-${a.id}`}>
          موافقة {a.id}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('@/components/dashboard/accountant/QuickActionsGrid', () => ({
  QuickActionsGrid: () => (
    <div data-testid="quick-actions">
      <button data-testid="add-entry-btn">إضافة قيد</button>
      <button data-testid="view-accounts-btn">دليل الحسابات</button>
    </div>
  ),
}));

vi.mock('@/components/dashboard/shared', () => ({
  CurrentFiscalYearCard: () => <div data-testid="fiscal-year-card">السنة المالية 2024</div>,
  RevenueProgressCard: () => <div data-testid="revenue-progress">تقدم الإيرادات: 75%</div>,
  FinancialCardsRow: ({ className }: { className?: string }) => (
    <div data-testid="financial-cards" className={className}>البطاقات المالية</div>
  ),
}));

vi.mock('@/components/nazer/LastSyncIndicator', () => ({
  LastSyncIndicator: ({ onRefresh }: { onRefresh?: () => void }) => (
    <div data-testid="last-sync">
      <span>آخر تحديث: الآن</span>
    </div>
  ),
}));

vi.mock('@/components/accounting/ApproveJournalDialog', () => ({
  ApproveJournalDialog: ({ open, approval }: { open: boolean; approval: any }) => (
    open && approval ? <div data-testid="approval-dialog">حوار الموافقة على {approval.id}</div> : null
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

describe('AccountantDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('التحميل والعرض الأساسي', () => {
    it('يعرض لوحة تحكم المحاسب بنجاح', async () => {
      render(<AccountantDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        // يجب أن تظهر بطاقات KPI
        expect(screen.getByText('موافقات معلقة')).toBeInTheDocument();
      });
    });

    it('يعرض بطاقات KPIs المحاسبية', async () => {
      render(<AccountantDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('موافقات معلقة')).toBeInTheDocument();
        expect(screen.getByText('قيود مسودة')).toBeInTheDocument();
        expect(screen.getByText('قيود مرحّلة')).toBeInTheDocument();
        expect(screen.getByText('قيود اليوم')).toBeInTheDocument();
      });
    });

    it('يعرض القيم الصحيحة في KPIs', async () => {
      render(<AccountantDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        // التحقق من عرض القيم الفعلية
        expect(screen.getByText('12')).toBeInTheDocument(); // pending approvals
        expect(screen.getByText('8')).toBeInTheDocument(); // draft entries
        expect(screen.getByText('245')).toBeInTheDocument(); // posted entries
        expect(screen.getByText('5')).toBeInTheDocument(); // today entries
      });
    });
  });

  describe('التبويبات', () => {
    it('يعرض تبويب نظرة عامة افتراضياً', async () => {
      render(<AccountantDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /نظرة عامة/i })).toHaveAttribute('data-state', 'active');
      });
    });

    it('يمكن التبديل إلى تبويب الموافقات', async () => {
      const user = userEvent.setup();
      render(<AccountantDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /الموافقات/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('tab', { name: /الموافقات/i }));

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /الموافقات/i })).toHaveAttribute('data-state', 'active');
        expect(screen.getByTestId('pending-approvals-list')).toBeInTheDocument();
      });
    });

    it('يمكن التبديل إلى تبويب القيود الأخيرة', async () => {
      const user = userEvent.setup();
      render(<AccountantDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /القيود الأخيرة/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('tab', { name: /القيود الأخيرة/i }));

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /القيود الأخيرة/i })).toHaveAttribute('data-state', 'active');
      });
    });
  });

  describe('الموافقات المعلقة', () => {
    it('يعرض قائمة الموافقات المعلقة', async () => {
      const user = userEvent.setup();
      render(<AccountantDashboard />, { wrapper: createWrapper() });

      // الانتقال لتبويب الموافقات
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /الموافقات/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('tab', { name: /الموافقات/i }));

      await waitFor(() => {
        expect(screen.getByTestId('pending-approvals-list')).toBeInTheDocument();
        expect(screen.getByTestId('approval-1')).toBeInTheDocument();
        expect(screen.getByTestId('approval-2')).toBeInTheDocument();
      });
    });

    it('يفتح حوار الموافقة عند النقر على موافقة', async () => {
      const user = userEvent.setup();
      render(<AccountantDashboard />, { wrapper: createWrapper() });

      // الانتقال لتبويب الموافقات
      await user.click(screen.getByRole('tab', { name: /الموافقات/i }));

      await waitFor(() => {
        expect(screen.getByTestId('approval-1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('approval-1'));

      await waitFor(() => {
        expect(screen.getByTestId('approval-dialog')).toBeInTheDocument();
      });
    });
  });

  describe('البطاقات المالية', () => {
    it('يعرض بطاقة السنة المالية', async () => {
      render(<AccountantDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('fiscal-year-card')).toBeInTheDocument();
      });
    });

    it('يعرض تقدم الإيرادات', async () => {
      render(<AccountantDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('revenue-progress')).toBeInTheDocument();
      });
    });

    it('يعرض البطاقات المالية', async () => {
      render(<AccountantDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('financial-cards')).toBeInTheDocument();
      });
    });
  });

  describe('الإجراءات السريعة', () => {
    it('يعرض الإجراءات السريعة في تبويب القيود الأخيرة', async () => {
      const user = userEvent.setup();
      render(<AccountantDashboard />, { wrapper: createWrapper() });

      await user.click(screen.getByRole('tab', { name: /القيود الأخيرة/i }));

      await waitFor(() => {
        expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
        expect(screen.getByTestId('add-entry-btn')).toBeInTheDocument();
        expect(screen.getByTestId('view-accounts-btn')).toBeInTheDocument();
      });
    });
  });

  describe('التحديث', () => {
    it('يعرض مؤشر آخر تحديث', async () => {
      render(<AccountantDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('last-sync')).toBeInTheDocument();
      });
    });

    it('يعرض زر التحديث', async () => {
      render(<AccountantDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        // زر RefreshCw
        const refreshButtons = screen.getAllByRole('button');
        expect(refreshButtons.length).toBeGreaterThan(0);
      });
    });
  });
});
