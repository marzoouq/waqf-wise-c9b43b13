/**
 * اختبارات لوحة تحكم المدير
 * AdminDashboard Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminDashboard from '@/pages/AdminDashboard';
import { AuthProvider } from '@/contexts/AuthContext';
import { adminUser } from '../../fixtures/users.fixtures';

// Mock hooks
vi.mock('@/hooks/dashboard/useAdminDashboardRealtime', () => ({
  useAdminDashboardRealtime: vi.fn(),
  useAdminDashboardRefresh: vi.fn(() => ({ refreshAll: vi.fn().mockResolvedValue(undefined) })),
}));

vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(() => ({
      user: { id: adminUser.id, email: adminUser.email },
      profile: { full_name: adminUser.profile.full_name },
      roles: adminUser.roles,
      isAuthenticated: true,
      isLoading: false,
    })),
  };
});

// Mock components
vi.mock('@/components/dashboard/admin/SystemHealthMonitor', () => ({
  SystemHealthMonitor: () => (
    <div data-testid="system-health">
      <span>صحة النظام: جيدة</span>
      <span data-testid="cpu-usage">CPU: 45%</span>
      <span data-testid="memory-usage">الذاكرة: 60%</span>
    </div>
  ),
}));

vi.mock('@/components/dashboard/admin/UserManagementSection', () => ({
  UserManagementSection: () => (
    <div data-testid="user-management">
      <span>إدارة المستخدمين</span>
      <span data-testid="total-users">50 مستخدم</span>
      <span data-testid="active-users">45 نشط</span>
    </div>
  ),
}));

vi.mock('@/components/dashboard/admin/SecurityAlertsSection', () => ({
  SecurityAlertsSection: () => (
    <div data-testid="security-alerts">
      <span>تنبيهات الأمان</span>
      <span data-testid="alerts-count">3 تنبيهات</span>
    </div>
  ),
}));

vi.mock('@/components/dashboard/admin/AuditLogsPreview', () => ({
  AuditLogsPreview: () => (
    <div data-testid="audit-logs">
      <span>سجلات التدقيق</span>
      <span data-testid="logs-today">25 سجل اليوم</span>
    </div>
  ),
}));

vi.mock('@/components/dashboard/admin/SystemPerformanceChart', () => ({
  SystemPerformanceChart: () => <div data-testid="performance-chart">مخطط الأداء</div>,
}));

vi.mock('@/components/dashboard/admin/UsersActivityChart', () => ({
  UsersActivityChart: () => <div data-testid="activity-chart">مخطط نشاط المستخدمين</div>,
}));

vi.mock('@/components/dashboard/admin/AdminSettingsSection', () => ({
  AdminSettingsSection: () => <div data-testid="admin-settings">إعدادات المدير</div>,
}));

vi.mock('@/components/dashboard/admin/AdminKPIs', () => ({
  AdminKPIs: () => (
    <div data-testid="admin-kpis">
      <div data-testid="kpi-users">50 مستخدم</div>
      <div data-testid="kpi-roles">6 أدوار</div>
      <div data-testid="kpi-sessions">35 جلسة نشطة</div>
    </div>
  ),
}));

vi.mock('@/components/dashboard/shared', () => ({
  CurrentFiscalYearCard: () => <div data-testid="fiscal-year-card">السنة المالية</div>,
  RevenueProgressCard: () => <div data-testid="revenue-progress">تقدم الإيرادات</div>,
  FinancialCardsRow: () => <div data-testid="financial-cards">البطاقات المالية</div>,
}));

vi.mock('@/components/nazer/LastSyncIndicator', () => ({
  LastSyncIndicator: ({ onRefresh }: { onRefresh: () => void }) => (
    <div data-testid="last-sync">
      <button onClick={onRefresh} data-testid="refresh-btn">تحديث</button>
    </div>
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

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('التحميل والعرض الأساسي', () => {
    it('يعرض لوحة تحكم المدير بنجاح', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('admin-kpis')).toBeInTheDocument();
      });
    });

    it('يعرض KPIs المدير', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('kpi-users')).toHaveTextContent('50 مستخدم');
        expect(screen.getByTestId('kpi-roles')).toHaveTextContent('6 أدوار');
        expect(screen.getByTestId('kpi-sessions')).toHaveTextContent('35 جلسة نشطة');
      });
    });
  });

  describe('التبويبات الخمسة', () => {
    it('يعرض تبويب النظام افتراضياً', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('system-health')).toBeInTheDocument();
        expect(screen.getByTestId('security-alerts')).toBeInTheDocument();
        expect(screen.getByTestId('audit-logs')).toBeInTheDocument();
      });
    });

    it('يمكن التبديل إلى تبويب المستخدمون', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /المستخدمون/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('tab', { name: /المستخدمون/i }));

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /المستخدمون/i })).toHaveAttribute('data-state', 'active');
      });
    });

    it('يمكن التبديل إلى تبويب الأمان', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /الأمان/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('tab', { name: /الأمان/i }));

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /الأمان/i })).toHaveAttribute('data-state', 'active');
      });
    });

    it('يمكن التبديل إلى تبويب الأداء', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /الأداء/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('tab', { name: /الأداء/i }));

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /الأداء/i })).toHaveAttribute('data-state', 'active');
      });
    });

    it('يمكن التبديل إلى تبويب الإعدادات', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /الإعدادات/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('tab', { name: /الإعدادات/i }));

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /الإعدادات/i })).toHaveAttribute('data-state', 'active');
      });
    });
  });

  describe('صحة النظام', () => {
    it('يعرض مؤشرات صحة النظام', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('system-health')).toBeInTheDocument();
        expect(screen.getByTestId('cpu-usage')).toHaveTextContent('CPU: 45%');
        expect(screen.getByTestId('memory-usage')).toHaveTextContent('الذاكرة: 60%');
      });
    });
  });

  describe('إدارة المستخدمين', () => {
    it('يعرض إحصائيات المستخدمين', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />, { wrapper: createWrapper() });

      // الانتقال لتبويب المستخدمين
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /المستخدمون/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('tab', { name: /المستخدمون/i }));

      await waitFor(() => {
        expect(screen.getByTestId('user-management')).toBeInTheDocument();
        expect(screen.getByTestId('total-users')).toHaveTextContent('50 مستخدم');
        expect(screen.getByTestId('active-users')).toHaveTextContent('45 نشط');
      });
    });
  });

  describe('تنبيهات الأمان', () => {
    it('يعرض عدد التنبيهات الأمنية', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('security-alerts')).toBeInTheDocument();
        expect(screen.getByTestId('alerts-count')).toHaveTextContent('3 تنبيهات');
      });
    });
  });

  describe('سجلات التدقيق', () => {
    it('يعرض معاينة سجلات التدقيق', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('audit-logs')).toBeInTheDocument();
        expect(screen.getByTestId('logs-today')).toHaveTextContent('25 سجل اليوم');
      });
    });
  });

  describe('البطاقات المالية', () => {
    it('يعرض بطاقة السنة المالية', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('fiscal-year-card')).toBeInTheDocument();
      });
    });

    it('يعرض تقدم الإيرادات', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('revenue-progress')).toBeInTheDocument();
      });
    });

    it('يعرض البطاقات المالية', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('financial-cards')).toBeInTheDocument();
      });
    });
  });

  describe('التحديث والمزامنة', () => {
    it('يعرض مؤشر آخر تحديث', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('last-sync')).toBeInTheDocument();
      });
    });

    it('يعرض زر إرسال رسالة', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /إرسال رسالة/i })).toBeInTheDocument();
      });
    });
  });
});
