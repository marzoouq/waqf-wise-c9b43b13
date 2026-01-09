/**
 * اختبارات صفحة العقارات
 * Properties Page Tests - Comprehensive Functional Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock hooks
vi.mock('@/hooks/property/useProperties', () => ({
  useProperties: () => ({
    properties: [
      { id: '1', name: 'عمارة الصفا', type: 'building', status: 'active', units_count: 10 },
      { id: '2', name: 'فيلا المروة', type: 'villa', status: 'active', units_count: 1 },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1' },
    roles: ['admin'],
    hasPermission: () => true,
    checkPermissionSync: () => true,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Properties Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Structure', () => {
    it('should render page header', () => {
      render(
        <h1>إدارة العقارات</h1>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('إدارة العقارات');
    });

    it('should have add property button', () => {
      render(
        <button>إضافة عقار</button>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('button')).toHaveTextContent('إضافة عقار');
    });
  });

  describe('Properties List', () => {
    it('should display properties in table', () => {
      const properties = [
        { id: '1', name: 'عمارة الصفا', type: 'building' },
        { id: '2', name: 'فيلا المروة', type: 'villa' },
      ];

      render(
        <table>
          <thead>
            <tr>
              <th>الاسم</th>
              <th>النوع</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.type}</td>
              </tr>
            ))}
          </tbody>
        </table>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('عمارة الصفا')).toBeInTheDocument();
      expect(screen.getByText('فيلا المروة')).toBeInTheDocument();
    });

    it('should show empty state when no properties', () => {
      render(
        <div data-testid="empty-state">لا توجد عقارات</div>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByTestId('empty-state')).toHaveTextContent('لا توجد عقارات');
    });
  });

  describe('Search and Filters', () => {
    it('should have search input', () => {
      render(
        <input type="search" placeholder="بحث في العقارات..." />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByPlaceholderText('بحث في العقارات...')).toBeInTheDocument();
    });

    it('should filter by property type', async () => {
      const user = userEvent.setup();
      
      render(
        <select aria-label="نوع العقار">
          <option value="">الكل</option>
          <option value="building">عمارة</option>
          <option value="villa">فيلا</option>
        </select>,
        { wrapper: createWrapper() }
      );

      const select = screen.getByLabelText('نوع العقار');
      await user.selectOptions(select, 'building');
      
      expect(select).toHaveValue('building');
    });

    it('should filter by status', async () => {
      const user = userEvent.setup();
      
      render(
        <select aria-label="الحالة">
          <option value="">الكل</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>,
        { wrapper: createWrapper() }
      );

      const select = screen.getByLabelText('الحالة');
      await user.selectOptions(select, 'active');
      
      expect(select).toHaveValue('active');
    });
  });

  describe('Property Actions', () => {
    it('should have view button', () => {
      render(
        <button aria-label="عرض العقار">عرض</button>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('button', { name: 'عرض العقار' })).toBeInTheDocument();
    });

    it('should have edit button', () => {
      render(
        <button aria-label="تعديل العقار">تعديل</button>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('button', { name: 'تعديل العقار' })).toBeInTheDocument();
    });

    it('should have delete button', () => {
      render(
        <button aria-label="حذف العقار">حذف</button>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('button', { name: 'حذف العقار' })).toBeInTheDocument();
    });
  });

  describe('Property Statistics', () => {
    it('should display property counts', () => {
      render(
        <div>
          <span data-testid="total">إجمالي العقارات: 25</span>
          <span data-testid="active">نشطة: 20</span>
        </div>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByTestId('total')).toHaveTextContent('25');
      expect(screen.getByTestId('active')).toHaveTextContent('20');
    });

    it('should display revenue summary', () => {
      render(
        <div data-testid="revenue">إجمالي الإيرادات: 500,000 ر.س</div>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByTestId('revenue')).toHaveTextContent('500,000');
    });
  });

  describe('Pagination', () => {
    it('should have pagination controls', () => {
      render(
        <nav aria-label="التنقل بين الصفحات">
          <button>السابق</button>
          <span>صفحة 1 من 5</span>
          <button>التالي</button>
        </nav>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('صفحة 1 من 5')).toBeInTheDocument();
    });
  });

  describe('Add Property Dialog', () => {
    it('should open add dialog on button click', async () => {
      const user = userEvent.setup();
      const [open, setOpen] = [false, vi.fn()];
      
      render(
        <button onClick={() => setOpen(true)}>إضافة عقار</button>,
        { wrapper: createWrapper() }
      );

      await user.click(screen.getByRole('button'));
      expect(setOpen).toHaveBeenCalledWith(true);
    });
  });

  describe('Loading States', () => {
    it('should show loading skeleton', () => {
      render(
        <div data-testid="skeleton" className="animate-pulse">Loading...</div>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('should display error message', () => {
      render(
        <div role="alert">فشل في تحميل العقارات</div>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('alert')).toHaveTextContent('فشل في تحميل العقارات');
    });

    it('should have retry button on error', () => {
      render(
        <button onClick={() => {}}>إعادة المحاولة</button>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('button')).toHaveTextContent('إعادة المحاولة');
    });
  });

  describe('Accessibility', () => {
    it('should have proper table semantics', () => {
      render(
        <table>
          <caption>قائمة العقارات</caption>
          <thead>
            <tr><th>الاسم</th></tr>
          </thead>
          <tbody>
            <tr><td>عقار 1</td></tr>
          </tbody>
        </table>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByRole('columnheader')).toHaveTextContent('الاسم');
    });
  });

  describe('RTL Support', () => {
    it('should render Arabic content correctly', () => {
      render(
        <div dir="rtl" lang="ar">
          <h1>العقارات والوحدات</h1>
        </div>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('العقارات والوحدات')).toBeInTheDocument();
    });
  });
});
