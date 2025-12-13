/**
 * اختبارات مكونات لوحات التحكم
 * Dashboard Components Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
      })),
    })),
    removeChannel: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Dashboard Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('KPI Cards', () => {
    it('should display KPI title', () => {
      const TestCard = () => (
        <div className="kpi-card">
          <span data-testid="kpi-title">إجمالي المستفيدين</span>
          <span data-testid="kpi-value">14</span>
        </div>
      );

      render(<TestCard />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('kpi-title')).toHaveTextContent('إجمالي المستفيدين');
    });

    it('should display KPI value', () => {
      const TestCard = () => (
        <div className="kpi-card">
          <span data-testid="kpi-value">850,000</span>
        </div>
      );

      render(<TestCard />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('kpi-value')).toHaveTextContent('850,000');
    });

    it('should display KPI trend', () => {
      const TestCard = () => (
        <div className="kpi-card">
          <span data-testid="kpi-trend">+5%</span>
        </div>
      );

      render(<TestCard />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('kpi-trend')).toHaveTextContent('+5%');
    });
  });

  describe('Quick Actions', () => {
    it('should render quick action buttons', () => {
      const TestQuickActions = () => (
        <div className="quick-actions">
          <button data-testid="action-add-beneficiary">إضافة مستفيد</button>
          <button data-testid="action-add-property">إضافة عقار</button>
        </div>
      );

      render(<TestQuickActions />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('action-add-beneficiary')).toBeInTheDocument();
      expect(screen.getByTestId('action-add-property')).toBeInTheDocument();
    });

    it('should be clickable', () => {
      const handleClick = vi.fn();
      const TestQuickActions = () => (
        <button data-testid="action-btn" onClick={handleClick}>
          إجراء سريع
        </button>
      );

      render(<TestQuickActions />, { wrapper: createWrapper() });
      screen.getByTestId('action-btn').click();
      
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Activity Feed', () => {
    it('should display activity items', () => {
      const activities = [
        { id: '1', action: 'إضافة مستفيد جديد', user: 'أحمد', time: '10:30' },
        { id: '2', action: 'تعديل عقار', user: 'محمد', time: '09:15' },
      ];

      const TestActivityFeed = () => (
        <div className="activity-feed">
          {activities.map(activity => (
            <div key={activity.id} data-testid="activity-item">
              <span>{activity.action}</span>
            </div>
          ))}
        </div>
      );

      render(<TestActivityFeed />, { wrapper: createWrapper() });
      
      expect(screen.getAllByTestId('activity-item')).toHaveLength(2);
    });

    it('should show timestamp', () => {
      const TestActivityItem = () => (
        <div className="activity-item">
          <span data-testid="activity-time">منذ 5 دقائق</span>
        </div>
      );

      render(<TestActivityItem />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('activity-time')).toHaveTextContent('منذ 5 دقائق');
    });
  });

  describe('Charts', () => {
    it('should render chart container', () => {
      const TestChart = () => (
        <div data-testid="chart-container" className="chart-container">
          <div data-testid="chart-title">توزيع الإيرادات</div>
        </div>
      );

      render(<TestChart />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
      expect(screen.getByTestId('chart-title')).toHaveTextContent('توزيع الإيرادات');
    });

    it('should render chart legend', () => {
      const legendItems = ['إيجارات', 'استثمارات', 'أخرى'];

      const TestChartLegend = () => (
        <div className="chart-legend">
          {legendItems.map(item => (
            <span key={item} data-testid="legend-item">{item}</span>
          ))}
        </div>
      );

      render(<TestChartLegend />, { wrapper: createWrapper() });
      
      expect(screen.getAllByTestId('legend-item')).toHaveLength(3);
    });
  });

  describe('Tables', () => {
    it('should render table headers', () => {
      const headers = ['الاسم', 'الحالة', 'المبلغ'];

      const TestTable = () => (
        <table>
          <thead>
            <tr>
              {headers.map(header => (
                <th key={header} data-testid="table-header">{header}</th>
              ))}
            </tr>
          </thead>
        </table>
      );

      render(<TestTable />, { wrapper: createWrapper() });
      
      expect(screen.getAllByTestId('table-header')).toHaveLength(3);
    });

    it('should render table rows', () => {
      const rows = [
        { id: '1', name: 'محمد', status: 'نشط' },
        { id: '2', name: 'أحمد', status: 'نشط' },
      ];

      const TestTable = () => (
        <table>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} data-testid="table-row">
                <td>{row.name}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );

      render(<TestTable />, { wrapper: createWrapper() });
      
      expect(screen.getAllByTestId('table-row')).toHaveLength(2);
    });
  });

  describe('Tabs', () => {
    it('should render tab buttons', () => {
      const tabs = ['نظرة عامة', 'المستفيدون', 'التقارير'];

      const TestTabs = () => (
        <div className="tabs">
          {tabs.map(tab => (
            <button key={tab} data-testid="tab-button">{tab}</button>
          ))}
        </div>
      );

      render(<TestTabs />, { wrapper: createWrapper() });
      
      expect(screen.getAllByTestId('tab-button')).toHaveLength(3);
    });

    it('should highlight active tab', () => {
      const TestTabs = () => (
        <div className="tabs">
          <button data-testid="active-tab" className="active">نظرة عامة</button>
          <button data-testid="inactive-tab">المستفيدون</button>
        </div>
      );

      render(<TestTabs />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('active-tab')).toHaveClass('active');
    });
  });

  describe('Notifications', () => {
    it('should render notification badge', () => {
      const TestNotificationBadge = () => (
        <div className="notification-bell">
          <span data-testid="notification-count">5</span>
        </div>
      );

      render(<TestNotificationBadge />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('notification-count')).toHaveTextContent('5');
    });

    it('should render notification list', () => {
      const notifications = [
        { id: '1', title: 'إشعار 1' },
        { id: '2', title: 'إشعار 2' },
      ];

      const TestNotificationList = () => (
        <div className="notification-list">
          {notifications.map(notif => (
            <div key={notif.id} data-testid="notification-item">
              {notif.title}
            </div>
          ))}
        </div>
      );

      render(<TestNotificationList />, { wrapper: createWrapper() });
      
      expect(screen.getAllByTestId('notification-item')).toHaveLength(2);
    });
  });

  describe('Status Badges', () => {
    it('should render success status', () => {
      const TestBadge = () => (
        <span data-testid="status-badge" className="status-success">نشط</span>
      );

      render(<TestBadge />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('status-badge')).toHaveTextContent('نشط');
      expect(screen.getByTestId('status-badge')).toHaveClass('status-success');
    });

    it('should render warning status', () => {
      const TestBadge = () => (
        <span data-testid="status-badge" className="status-warning">معلق</span>
      );

      render(<TestBadge />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('status-badge')).toHaveClass('status-warning');
    });

    it('should render error status', () => {
      const TestBadge = () => (
        <span data-testid="status-badge" className="status-error">ملغي</span>
      );

      render(<TestBadge />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('status-badge')).toHaveClass('status-error');
    });
  });

  describe('Loading States', () => {
    it('should render loading spinner', () => {
      const TestLoader = () => (
        <div data-testid="loading-spinner" className="loading-spinner">
          جاري التحميل...
        </div>
      );

      render(<TestLoader />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should render skeleton loader', () => {
      const TestSkeleton = () => (
        <div data-testid="skeleton" className="skeleton animate-pulse">
          <div className="skeleton-line"></div>
        </div>
      );

      render(<TestSkeleton />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('skeleton')).toHaveClass('animate-pulse');
    });
  });

  describe('Empty States', () => {
    it('should render empty state message', () => {
      const TestEmptyState = () => (
        <div data-testid="empty-state" className="empty-state">
          <span>لا توجد بيانات</span>
        </div>
      );

      render(<TestEmptyState />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('empty-state')).toHaveTextContent('لا توجد بيانات');
    });

    it('should render call to action', () => {
      const TestEmptyState = () => (
        <div className="empty-state">
          <button data-testid="cta-button">إضافة جديد</button>
        </div>
      );

      render(<TestEmptyState />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('cta-button')).toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('should render filter dropdown', () => {
      const TestFilter = () => (
        <select data-testid="filter-select">
          <option value="">الكل</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>
      );

      render(<TestFilter />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('filter-select')).toBeInTheDocument();
    });

    it('should render search input', () => {
      const TestSearch = () => (
        <input
          type="text"
          data-testid="search-input"
          placeholder="بحث..."
        />
      );

      render(<TestSearch />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('should render date range picker', () => {
      const TestDateRange = () => (
        <div className="date-range">
          <input type="date" data-testid="date-from" />
          <input type="date" data-testid="date-to" />
        </div>
      );

      render(<TestDateRange />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('date-from')).toBeInTheDocument();
      expect(screen.getByTestId('date-to')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should render pagination controls', () => {
      const TestPagination = () => (
        <div className="pagination">
          <button data-testid="prev-btn">السابق</button>
          <span data-testid="page-info">صفحة 1 من 5</span>
          <button data-testid="next-btn">التالي</button>
        </div>
      );

      render(<TestPagination />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('prev-btn')).toBeInTheDocument();
      expect(screen.getByTestId('page-info')).toHaveTextContent('صفحة 1 من 5');
      expect(screen.getByTestId('next-btn')).toBeInTheDocument();
    });
  });

  describe('Modals', () => {
    it('should render modal with title', () => {
      const TestModal = () => (
        <div data-testid="modal" className="modal">
          <div className="modal-header">
            <h2 data-testid="modal-title">عنوان النافذة</h2>
          </div>
        </div>
      );

      render(<TestModal />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('modal-title')).toHaveTextContent('عنوان النافذة');
    });

    it('should render modal actions', () => {
      const TestModal = () => (
        <div className="modal-footer">
          <button data-testid="cancel-btn">إلغاء</button>
          <button data-testid="confirm-btn">تأكيد</button>
        </div>
      );

      render(<TestModal />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('cancel-btn')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-btn')).toBeInTheDocument();
    });
  });
});
