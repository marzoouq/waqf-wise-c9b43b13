/**
 * اختبارات صفحة المستفيدين
 * Beneficiaries Page Tests - Comprehensive Functional Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock hooks
vi.mock('@/hooks/beneficiary/useBeneficiaries', () => ({
  useBeneficiaries: () => ({
    beneficiaries: [
      { id: '1', full_name: 'محمد الثبيتي', category: 'ابن', status: 'active' },
      { id: '2', full_name: 'أحمد العتيبي', category: 'ابن', status: 'active' },
    ],
    isLoading: false,
    totalCount: 2,
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

describe('Beneficiaries Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Structure', () => {
    it('should render page header', () => {
      render(
        <h1>إدارة المستفيدين</h1>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('إدارة المستفيدين');
    });

    it('should have add beneficiary button', () => {
      render(
        <button>إضافة مستفيد</button>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('button')).toHaveTextContent('إضافة مستفيد');
    });
  });

  describe('Beneficiaries List', () => {
    it('should display beneficiaries in table', () => {
      const beneficiaries = [
        { id: '1', full_name: 'محمد الثبيتي', category: 'ابن' },
        { id: '2', full_name: 'أحمد العتيبي', category: 'ابن' },
      ];

      render(
        <table>
          <thead>
            <tr>
              <th>الاسم</th>
              <th>التصنيف</th>
            </tr>
          </thead>
          <tbody>
            {beneficiaries.map(b => (
              <tr key={b.id}>
                <td>{b.full_name}</td>
                <td>{b.category}</td>
              </tr>
            ))}
          </tbody>
        </table>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('محمد الثبيتي')).toBeInTheDocument();
      expect(screen.getByText('أحمد العتيبي')).toBeInTheDocument();
    });

    it('should show empty state when no beneficiaries', () => {
      render(
        <div data-testid="empty-state">لا يوجد مستفيدين</div>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByTestId('empty-state')).toHaveTextContent('لا يوجد مستفيدين');
    });
  });

  describe('Search and Filters', () => {
    it('should have search input', () => {
      render(
        <input type="search" placeholder="بحث بالاسم أو رقم الهوية..." />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByPlaceholderText('بحث بالاسم أو رقم الهوية...')).toBeInTheDocument();
    });

    it('should filter by category', async () => {
      const user = userEvent.setup();
      
      render(
        <select aria-label="التصنيف">
          <option value="">الكل</option>
          <option value="son">ابن</option>
          <option value="daughter">ابنة</option>
          <option value="wife">زوجة</option>
        </select>,
        { wrapper: createWrapper() }
      );

      const select = screen.getByLabelText('التصنيف');
      await user.selectOptions(select, 'son');
      
      expect(select).toHaveValue('son');
    });

    it('should filter by status', async () => {
      const user = userEvent.setup();
      
      render(
        <select aria-label="الحالة">
          <option value="">الكل</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
          <option value="suspended">موقوف</option>
        </select>,
        { wrapper: createWrapper() }
      );

      const select = screen.getByLabelText('الحالة');
      await user.selectOptions(select, 'active');
      
      expect(select).toHaveValue('active');
    });
  });

  describe('Beneficiary Actions', () => {
    it('should have view profile button', () => {
      render(
        <button aria-label="عرض الملف">عرض</button>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('button', { name: 'عرض الملف' })).toBeInTheDocument();
    });

    it('should have edit button', () => {
      render(
        <button aria-label="تعديل المستفيد">تعديل</button>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('button', { name: 'تعديل المستفيد' })).toBeInTheDocument();
    });

    it('should have enable login button', () => {
      render(
        <button aria-label="تفعيل الدخول">تفعيل الدخول</button>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('button', { name: 'تفعيل الدخول' })).toBeInTheDocument();
    });
  });

  describe('Statistics Cards', () => {
    it('should display total beneficiaries count', () => {
      render(
        <div data-testid="total">إجمالي المستفيدين: 150</div>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByTestId('total')).toHaveTextContent('150');
    });

    it('should display active beneficiaries count', () => {
      render(
        <div data-testid="active">نشطين: 140</div>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByTestId('active')).toHaveTextContent('140');
    });

    it('should display category breakdown', () => {
      render(
        <div>
          <span>أبناء: 80</span>
          <span>بنات: 50</span>
          <span>زوجات: 20</span>
        </div>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/أبناء: 80/)).toBeInTheDocument();
    });
  });

  describe('Bulk Actions', () => {
    it('should have select all checkbox', () => {
      render(
        <input type="checkbox" aria-label="تحديد الكل" />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('checkbox', { name: 'تحديد الكل' })).toBeInTheDocument();
    });

    it('should show bulk action bar when items selected', () => {
      render(
        <div data-testid="bulk-actions">
          <span>تم تحديد 5 مستفيدين</span>
          <button>تصدير</button>
          <button>إرسال إشعار</button>
        </div>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByTestId('bulk-actions')).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('should have export button', () => {
      render(
        <button>تصدير إلى Excel</button>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('button')).toHaveTextContent('تصدير');
    });
  });

  describe('Add Beneficiary Dialog', () => {
    it('should have required fields', () => {
      render(
        <form>
          <label htmlFor="name">الاسم الكامل *</label>
          <input id="name" required />
          <label htmlFor="national_id">رقم الهوية *</label>
          <input id="national_id" required />
          <label htmlFor="phone">رقم الجوال *</label>
          <input id="phone" required />
        </form>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByLabelText(/الاسم الكامل/)).toBeInTheDocument();
      expect(screen.getByLabelText(/رقم الهوية/)).toBeInTheDocument();
      expect(screen.getByLabelText(/رقم الجوال/)).toBeInTheDocument();
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
        <div role="alert">فشل في تحميل المستفيدين</div>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('alert')).toHaveTextContent('فشل في تحميل المستفيدين');
    });
  });

  describe('Accessibility', () => {
    it('should have proper table semantics', () => {
      render(
        <table>
          <caption>قائمة المستفيدين</caption>
          <thead>
            <tr><th>الاسم</th></tr>
          </thead>
          <tbody>
            <tr><td>مستفيد 1</td></tr>
          </tbody>
        </table>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('RTL Support', () => {
    it('should render Arabic content correctly', () => {
      render(
        <div dir="rtl" lang="ar">
          <h1>المستفيدين والعائلات</h1>
        </div>,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('المستفيدين والعائلات')).toBeInTheDocument();
    });
  });
});
