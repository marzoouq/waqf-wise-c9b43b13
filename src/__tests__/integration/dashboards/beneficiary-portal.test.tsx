/**
 * اختبارات بوابة المستفيد
 * BeneficiaryPortal Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BeneficiaryPortal from '@/pages/BeneficiaryPortal';
import { AuthProvider } from '@/contexts/AuthContext';
import { mohamedMarzouq } from '../../fixtures/users.fixtures';

// Mock beneficiary data
const mockBeneficiary = {
  id: mohamedMarzouq.id,
  full_name: 'محمد مرزوق',
  national_id: '1086970629',
  phone: '0500000001',
  email: '1086970629@waqf.internal',
  category: 'son',
  status: 'active',
  account_balance: 15000,
  total_received: 125000,
  bank_name: 'الراجحي',
  iban: 'SA1234567890123456789012',
};

const mockStatistics = {
  totalReceived: 125000,
  lastPayment: 5000,
  pendingRequests: 2,
  upcomingDistribution: 5000,
};

// Mock hooks
vi.mock('@/hooks/beneficiary/useBeneficiaryPortalData', () => ({
  useBeneficiaryPortalData: vi.fn(() => ({
    beneficiary: mockBeneficiary,
    statistics: mockStatistics,
    isLoading: false,
    isPreviewMode: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

vi.mock('@/hooks/beneficiary/useBeneficiarySession', () => ({
  useBeneficiarySession: vi.fn(),
}));

vi.mock('@/hooks/dashboard/useBeneficiaryDashboardRealtime', () => ({
  useBeneficiaryDashboardRealtime: vi.fn(),
}));

vi.mock('@/hooks/governance/useVisibilitySettings', () => ({
  useVisibilitySettings: vi.fn(() => ({
    settings: {
      show_overview: true,
      show_payments: true,
      show_distributions: true,
      show_requests: true,
      show_documents: true,
      show_support: true,
    },
  })),
}));

vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(() => ({
      user: { id: mohamedMarzouq.id, email: mohamedMarzouq.email },
      profile: { full_name: 'محمد مرزوق' },
      roles: mohamedMarzouq.roles,
      isAuthenticated: true,
      isLoading: false,
    })),
  };
});

// Mock components
vi.mock('@/components/beneficiary/FiscalYearNotPublishedBanner', () => ({
  FiscalYearNotPublishedBanner: () => null,
}));

vi.mock('@/components/beneficiary/PreviewModeBanner', () => ({
  PreviewModeBanner: ({ beneficiaryName, onClose }: { beneficiaryName?: string; onClose: () => void }) => (
    <div data-testid="preview-banner">
      وضع المعاينة: {beneficiaryName}
      <button onClick={onClose}>إغلاق</button>
    </div>
  ),
}));

vi.mock('@/components/beneficiary/sections/OverviewSection', () => ({
  OverviewSection: ({ beneficiary }: { beneficiary: any }) => (
    <div data-testid="overview-section">
      <div data-testid="beneficiary-name">{beneficiary.full_name}</div>
      <div data-testid="account-balance">{beneficiary.account_balance.toLocaleString()} ريال</div>
      <div data-testid="total-received">{beneficiary.total_received.toLocaleString()} ريال</div>
      <div data-testid="beneficiary-status">{beneficiary.status === 'active' ? 'نشط' : 'غير نشط'}</div>
    </div>
  ),
}));

vi.mock('@/components/beneficiary/TabRenderer', () => ({
  TabRenderer: ({ activeTab }: { activeTab: string }) => (
    <div data-testid="tab-renderer">
      <div data-testid="active-tab">{activeTab}</div>
    </div>
  ),
}));

vi.mock('@/components/beneficiary/BeneficiarySidebar', () => ({
  BeneficiarySidebar: ({ activeTab, onTabChange, beneficiaryName }: { activeTab: string; onTabChange: (tab: string) => void; beneficiaryName: string }) => (
    <div data-testid="beneficiary-sidebar">
      <span data-testid="sidebar-name">{beneficiaryName}</span>
      <button data-testid="tab-overview" onClick={() => onTabChange('overview')}>نظرة عامة</button>
      <button data-testid="tab-payments" onClick={() => onTabChange('payments')}>المدفوعات</button>
      <button data-testid="tab-requests" onClick={() => onTabChange('requests')}>الطلبات</button>
      <button data-testid="tab-documents" onClick={() => onTabChange('documents')}>المستندات</button>
      <button data-testid="tab-support" onClick={() => onTabChange('support')}>الدعم</button>
    </div>
  ),
}));

vi.mock('@/components/mobile/BottomNavigation', () => ({
  BottomNavigation: () => <nav data-testid="bottom-nav">التنقل السفلي</nav>,
}));

const createWrapper = (initialRoute = '/beneficiary-portal') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('BeneficiaryPortal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('التحميل والعرض الأساسي', () => {
    it('يعرض بوابة المستفيد بنجاح', async () => {
      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('overview-section')).toBeInTheDocument();
      });
    });

    it('يعرض اسم المستفيد', async () => {
      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('beneficiary-name')).toHaveTextContent('محمد مرزوق');
      });
    });

    it('يعرض رصيد الحساب', async () => {
      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('account-balance')).toHaveTextContent('15,000 ريال');
      });
    });

    it('يعرض إجمالي المبالغ المستلمة', async () => {
      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('total-received')).toHaveTextContent('125,000 ريال');
      });
    });

    it('يعرض حالة المستفيد', async () => {
      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('beneficiary-status')).toHaveTextContent('نشط');
      });
    });
  });

  describe('الشريط الجانبي', () => {
    it('يعرض الشريط الجانبي', async () => {
      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('beneficiary-sidebar')).toBeInTheDocument();
      });
    });

    it('يعرض اسم المستفيد في الشريط الجانبي', async () => {
      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('sidebar-name')).toHaveTextContent('محمد مرزوق');
      });
    });
  });

  describe('التنقل بين التبويبات', () => {
    it('يعرض تبويب نظرة عامة افتراضياً', async () => {
      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('overview-section')).toBeInTheDocument();
      });
    });

    it('يمكن التبديل إلى تبويب المدفوعات', async () => {
      const user = userEvent.setup();
      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('tab-payments')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('tab-payments'));

      await waitFor(() => {
        expect(screen.getByTestId('active-tab')).toHaveTextContent('payments');
      });
    });

    it('يمكن التبديل إلى تبويب الطلبات', async () => {
      const user = userEvent.setup();
      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('tab-requests')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('tab-requests'));

      await waitFor(() => {
        expect(screen.getByTestId('active-tab')).toHaveTextContent('requests');
      });
    });

    it('يمكن التبديل إلى تبويب المستندات', async () => {
      const user = userEvent.setup();
      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('tab-documents')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('tab-documents'));

      await waitFor(() => {
        expect(screen.getByTestId('active-tab')).toHaveTextContent('documents');
      });
    });

    it('يمكن التبديل إلى تبويب الدعم', async () => {
      const user = userEvent.setup();
      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('tab-support')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('tab-support'));

      await waitFor(() => {
        expect(screen.getByTestId('active-tab')).toHaveTextContent('support');
      });
    });
  });

  describe('التنقل السفلي للجوال', () => {
    it('يعرض شريط التنقل السفلي', async () => {
      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
      });
    });
  });

  describe('وضع المعاينة', () => {
    it('يعرض بانر المعاينة عند تفعيله', async () => {
      const { useBeneficiaryPortalData } = await import('@/hooks/beneficiary/useBeneficiaryPortalData');
      vi.mocked(useBeneficiaryPortalData).mockReturnValue({
        beneficiary: mockBeneficiary,
        statistics: mockStatistics,
        isLoading: false,
        isPreviewMode: true, // تفعيل وضع المعاينة
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('preview-banner')).toBeInTheDocument();
      });
    });
  });

  describe('حالات الخطأ', () => {
    it('يعرض رسالة خطأ عند فشل التحميل', async () => {
      const { useBeneficiaryPortalData } = await import('@/hooks/beneficiary/useBeneficiaryPortalData');
      vi.mocked(useBeneficiaryPortalData).mockReturnValue({
        beneficiary: null,
        statistics: null,
        isLoading: false,
        isPreviewMode: false,
        error: new Error('فشل التحميل'),
        refetch: vi.fn(),
      } as any);

      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/خطأ في تحميل البيانات/i)).toBeInTheDocument();
      });
    });

    it('يعرض رسالة عند عدم وجود بيانات المستفيد', async () => {
      const { useBeneficiaryPortalData } = await import('@/hooks/beneficiary/useBeneficiaryPortalData');
      vi.mocked(useBeneficiaryPortalData).mockReturnValue({
        beneficiary: null,
        statistics: null,
        isLoading: false,
        isPreviewMode: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/لم يتم العثور على بيانات المستفيد/i)).toBeInTheDocument();
      });
    });
  });

  describe('حالة التحميل', () => {
    it('يعرض حالة التحميل', async () => {
      const { useBeneficiaryPortalData } = await import('@/hooks/beneficiary/useBeneficiaryPortalData');
      vi.mocked(useBeneficiaryPortalData).mockReturnValue({
        beneficiary: null,
        statistics: null,
        isLoading: true,
        isPreviewMode: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      // LoadingState component should be rendered
      expect(document.querySelector('[class*="loading"]') || screen.queryByRole('status')).toBeTruthy();
    });
  });

  describe('بيانات محمد مرزوق الحقيقية', () => {
    it('يعرض البيانات الشخصية الصحيحة', async () => {
      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('beneficiary-name')).toHaveTextContent('محمد مرزوق');
      });
    });

    it('يظهر المستفيد بحالة نشطة', async () => {
      render(<BeneficiaryPortal />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('beneficiary-status')).toHaveTextContent('نشط');
      });
    });
  });
});
