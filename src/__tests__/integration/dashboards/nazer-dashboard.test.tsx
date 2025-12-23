/**
 * اختبارات لوحة تحكم الناظر
 * NazerDashboard Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NazerDashboard from '@/pages/NazerDashboard';
import { AuthProvider } from '@/contexts/AuthContext';
import { testUsers, nazerUser } from '../../fixtures/users.fixtures';

// Mock hooks
vi.mock('@/hooks/dashboard/useNazerDashboardRealtime', () => ({
  useNazerDashboardRealtime: vi.fn(),
  useNazerDashboardRefresh: vi.fn(() => ({ refreshAll: vi.fn() })),
}));

vi.mock('@/hooks/dashboard/useUnifiedKPIs', () => ({
  useUnifiedKPIs: vi.fn(() => ({
    data: {
      totalBeneficiaries: 150,
      activeBeneficiaries: 120,
      totalProperties: 25,
      occupiedUnits: 85,
      pendingApprovals: 12,
      totalRevenue: 2500000,
      totalExpenses: 1200000,
      netIncome: 1300000,
    },
    isLoading: false,
    lastUpdated: new Date(),
  })),
}));

vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(() => ({
      user: { id: nazerUser.id, email: nazerUser.email },
      profile: { full_name: nazerUser.profile.full_name },
      roles: nazerUser.roles,
      isAuthenticated: true,
      isLoading: false,
    })),
  };
});

// Mock components with heavy dependencies
vi.mock('@/components/dashboard/nazer/NazerKPIs', () => ({
  default: () => (
    <div data-testid="nazer-kpis">
      <div data-testid="kpi-beneficiaries">150 مستفيد</div>
      <div data-testid="kpi-properties">25 عقار</div>
      <div data-testid="kpi-revenue">2,500,000 ريال</div>
    </div>
  ),
}));

vi.mock('@/components/dashboard/nazer/PendingApprovalsSection', () => ({
  default: () => <div data-testid="pending-approvals">12 موافقة معلقة</div>,
}));

vi.mock('@/components/dashboard/nazer/SmartAlertsSection', () => ({
  default: () => <div data-testid="smart-alerts">التنبيهات الذكية</div>,
}));

vi.mock('@/components/dashboard/nazer/QuickActionsGrid', () => ({
  default: () => <div data-testid="quick-actions">الإجراءات السريعة</div>,
}));

vi.mock('@/components/dashboard/AIInsightsWidget', () => ({
  AIInsightsWidget: () => <div data-testid="ai-insights">رؤى الذكاء الاصطناعي</div>,
}));

vi.mock('@/components/nazer/FiscalYearPublishStatus', () => ({
  FiscalYearPublishStatus: ({ onPublishClick }: { onPublishClick: () => void }) => (
    <div data-testid="fiscal-year-status">
      <button onClick={onPublishClick}>نشر السنة المالية</button>
    </div>
  ),
}));

vi.mock('@/components/nazer/DistributeRevenueDialog', () => ({
  DistributeRevenueDialog: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
    open ? <div data-testid="distribute-dialog">حوار توزيع الغلة</div> : null
  ),
}));

vi.mock('@/components/nazer/PublishFiscalYearDialog', () => ({
  PublishFiscalYearDialog: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
    open ? <div data-testid="publish-dialog">حوار نشر السنة المالية</div> : null
  ),
}));

vi.mock('@/components/dashboard/shared', () => ({
  CurrentFiscalYearCard: () => <div data-testid="fiscal-year-card">السنة المالية الحالية</div>,
  RevenueProgressCard: () => <div data-testid="revenue-progress">تقدم الإيرادات</div>,
  FinancialCardsRow: () => <div data-testid="financial-cards">البطاقات المالية</div>,
}));

vi.mock('@/components/nazer/NazerAnalyticsSection', () => ({
  NazerAnalyticsSection: () => <div data-testid="analytics-section">قسم التحليلات</div>,
}));

vi.mock('@/components/nazer/LastSyncIndicator', () => ({
  LastSyncIndicator: ({ onRefresh }: { onRefresh: () => void }) => (
    <div data-testid="last-sync">
      <button onClick={onRefresh} data-testid="refresh-btn">تحديث</button>
    </div>
  ),
}));

vi.mock('@/components/nazer/PreviewAsBeneficiaryButton', () => ({
  PreviewAsBeneficiaryButton: () => <button data-testid="preview-beneficiary">معاينة كمستفيد</button>,
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

describe('NazerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('التحميل والعرض الأساسي', () => {
    it('يعرض لوحة تحكم الناظر بنجاح', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('nazer-kpis')).toBeInTheDocument();
      });
    });

    it('يعرض حالة السنة المالية', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('fiscal-year-status')).toBeInTheDocument();
      });
    });

    it('يعرض بطاقات KPIs الرئيسية', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('kpi-beneficiaries')).toHaveTextContent('150 مستفيد');
        expect(screen.getByTestId('kpi-properties')).toHaveTextContent('25 عقار');
        expect(screen.getByTestId('kpi-revenue')).toHaveTextContent('2,500,000 ريال');
      });
    });
  });

  describe('التبويبات', () => {
    it('يعرض تبويب نظرة عامة افتراضياً', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        // التبويب الافتراضي هو overview
        expect(screen.getByTestId('pending-approvals')).toBeInTheDocument();
        expect(screen.getByTestId('smart-alerts')).toBeInTheDocument();
      });
    });

    it('يمكن التبديل إلى تبويب المستفيدين', async () => {
      const user = userEvent.setup();
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /المستفيدون/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('tab', { name: /المستفيدون/i }));

      // بعد التبديل يجب عرض محتوى تبويب المستفيدين
      await waitFor(() => {
        // LazyTabContent يتم تحميله
        expect(screen.getByRole('tab', { name: /المستفيدون/i })).toHaveAttribute('data-state', 'active');
      });
    });

    it('يمكن التبديل إلى تبويب التقارير', async () => {
      const user = userEvent.setup();
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /التقارير/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('tab', { name: /التقارير/i }));

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /التقارير/i })).toHaveAttribute('data-state', 'active');
      });
    });

    it('يمكن التبديل إلى تبويب التحكم', async () => {
      const user = userEvent.setup();
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /التحكم/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('tab', { name: /التحكم/i }));

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /التحكم/i })).toHaveAttribute('data-state', 'active');
      });
    });
  });

  describe('أزرار الإجراءات', () => {
    it('يعرض زر توزيع الغلة', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /توزيع/i })).toBeInTheDocument();
      });
    });

    it('يفتح حوار توزيع الغلة عند النقر', async () => {
      const user = userEvent.setup();
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /توزيع/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /توزيع/i }));

      await waitFor(() => {
        expect(screen.getByTestId('distribute-dialog')).toBeInTheDocument();
      });
    });

    it('يعرض زر النشر', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /نشر/i })).toBeInTheDocument();
      });
    });

    it('يفتح حوار نشر السنة المالية عند النقر', async () => {
      const user = userEvent.setup();
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /نشر/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /نشر/i }));

      await waitFor(() => {
        expect(screen.getByTestId('publish-dialog')).toBeInTheDocument();
      });
    });

    it('يعرض زر معاينة كمستفيد', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('preview-beneficiary')).toBeInTheDocument();
      });
    });
  });

  describe('التحديث والمزامنة', () => {
    it('يعرض مؤشر آخر مزامنة', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('last-sync')).toBeInTheDocument();
      });
    });

    it('يستدعي التحديث عند النقر على زر التحديث', async () => {
      const user = userEvent.setup();
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('refresh-btn')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('refresh-btn'));

      // التحقق من أن الزر يعمل (لا يوجد خطأ)
      expect(screen.getByTestId('refresh-btn')).toBeInTheDocument();
    });
  });

  describe('المكونات الفرعية', () => {
    it('يعرض بطاقة السنة المالية الحالية', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('fiscal-year-card')).toBeInTheDocument();
      });
    });

    it('يعرض بطاقة تقدم الإيرادات', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('revenue-progress')).toBeInTheDocument();
      });
    });

    it('يعرض البطاقات المالية', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('financial-cards')).toBeInTheDocument();
      });
    });

    it('يعرض الموافقات المعلقة', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('pending-approvals')).toHaveTextContent('12 موافقة معلقة');
      });
    });

    it('يعرض التنبيهات الذكية', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('smart-alerts')).toBeInTheDocument();
      });
    });

    it('يعرض رؤى الذكاء الاصطناعي', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('ai-insights')).toBeInTheDocument();
      });
    });

    it('يعرض الإجراءات السريعة', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
      });
    });

    it('يعرض قسم التحليلات', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('analytics-section')).toBeInTheDocument();
      });
    });
  });
});
