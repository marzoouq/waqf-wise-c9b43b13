/**
 * اختبارات لوحة تحكم أمين الأرشيف
 * ArchivistDashboard Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ArchivistDashboard from '@/pages/ArchivistDashboard';
import { AuthProvider } from '@/contexts/AuthContext';
import { archivistUser } from '../../fixtures/users.fixtures';

// Mock hooks
vi.mock('@/hooks/archive', () => ({
  useArchivistDashboard: vi.fn(() => ({
    stats: {
      totalFolders: 25,
      totalDocuments: 450,
      todayUploads: 12,
      totalSize: '2.5 GB',
    },
    statsLoading: false,
    recentDocuments: [
      { id: '1', name: 'عقد إيجار - عمارة الرياض.pdf', category: 'عقود', uploaded_at: new Date().toISOString(), folders: { name: 'عقود 2024' } },
      { id: '2', name: 'فاتورة صيانة #123.pdf', category: 'فواتير', uploaded_at: new Date().toISOString(), folders: { name: 'فواتير' } },
      { id: '3', name: 'تقرير الربع الأول.xlsx', category: 'تقارير', uploaded_at: new Date().toISOString(), folders: { name: 'تقارير مالية' } },
    ],
    docsLoading: false,
  })),
}));

vi.mock('@/hooks/archive/useArchivistDashboardRealtime', () => ({
  useArchivistDashboardRealtime: vi.fn(),
  useArchivistDashboardRefresh: vi.fn(() => ({ refreshAll: vi.fn() })),
}));

vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(() => ({
      user: { id: archivistUser.id, email: archivistUser.email },
      profile: { full_name: archivistUser.profile.full_name },
      roles: archivistUser.roles,
      isAuthenticated: true,
      isLoading: false,
    })),
  };
});

// Mock components
vi.mock('@/components/dashboard/archivist/DocumentsGrowthChart', () => ({
  DocumentsGrowthChart: () => <div data-testid="growth-chart">مخطط نمو المستندات</div>,
}));

vi.mock('@/components/dashboard/archivist/StorageUsageChart', () => ({
  StorageUsageChart: () => <div data-testid="storage-chart">مخطط استخدام التخزين</div>,
}));

vi.mock('@/components/shared/BankBalanceCard', () => ({
  BankBalanceCard: () => <div data-testid="bank-balance">رصيد البنك</div>,
}));

vi.mock('@/components/shared/WaqfCorpusCard', () => ({
  WaqfCorpusCard: () => <div data-testid="waqf-corpus">رقبة الوقف</div>,
}));

vi.mock('@/components/dashboard/shared/CurrentFiscalYearCard', () => ({
  CurrentFiscalYearCard: () => <div data-testid="fiscal-year">السنة المالية</div>,
}));

vi.mock('@/components/nazer/LastSyncIndicator', () => ({
  LastSyncIndicator: ({ lastUpdated }: { lastUpdated?: Date }) => (
    <div data-testid="last-sync">آخر تحديث</div>
  ),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

describe('ArchivistDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('التحميل والعرض الأساسي', () => {
    it('يعرض لوحة تحكم أمين الأرشيف بنجاح', async () => {
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('المجلدات')).toBeInTheDocument();
      });
    });

    it('يعرض بطاقات KPIs الأربع', async () => {
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('المجلدات')).toBeInTheDocument();
        expect(screen.getByText('المستندات')).toBeInTheDocument();
        expect(screen.getByText('رفع اليوم')).toBeInTheDocument();
        expect(screen.getByText('المساحة')).toBeInTheDocument();
      });
    });

    it('يعرض القيم الصحيحة', async () => {
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument(); // المجلدات
        expect(screen.getByText('450')).toBeInTheDocument(); // المستندات
        expect(screen.getByText('12')).toBeInTheDocument(); // رفع اليوم
        expect(screen.getByText('2.5 GB')).toBeInTheDocument(); // المساحة
      });
    });
  });

  describe('البطاقات المالية', () => {
    it('يعرض بطاقة رصيد البنك', async () => {
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('bank-balance')).toBeInTheDocument();
      });
    });

    it('يعرض بطاقة رقبة الوقف', async () => {
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('waqf-corpus')).toBeInTheDocument();
      });
    });

    it('يعرض بطاقة السنة المالية', async () => {
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('fiscal-year')).toBeInTheDocument();
      });
    });
  });

  describe('الرسوم البيانية', () => {
    it('يعرض مخطط نمو المستندات', async () => {
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('growth-chart')).toBeInTheDocument();
      });
    });

    it('يعرض مخطط استخدام التخزين', async () => {
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('storage-chart')).toBeInTheDocument();
      });
    });
  });

  describe('البحث والفلترة', () => {
    it('يعرض حقل البحث', async () => {
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('البحث في المستندات...')).toBeInTheDocument();
      });
    });

    it('يعرض قائمة التصنيفات', async () => {
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
    });

    it('يمكن الكتابة في حقل البحث', async () => {
      const user = userEvent.setup();
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      const searchInput = await screen.findByPlaceholderText('البحث في المستندات...');
      await user.type(searchInput, 'عقد');

      expect(searchInput).toHaveValue('عقد');
    });
  });

  describe('المستندات الأخيرة', () => {
    it('يعرض قائمة المستندات الأخيرة', async () => {
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('المستندات الأخيرة')).toBeInTheDocument();
        expect(screen.getByText('عقد إيجار - عمارة الرياض.pdf')).toBeInTheDocument();
        expect(screen.getByText('فاتورة صيانة #123.pdf')).toBeInTheDocument();
        expect(screen.getByText('تقرير الربع الأول.xlsx')).toBeInTheDocument();
      });
    });

    it('يعرض تصنيف كل مستند', async () => {
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/عقود 2024/)).toBeInTheDocument();
        expect(screen.getByText(/فواتير/)).toBeInTheDocument();
        expect(screen.getByText(/تقارير مالية/)).toBeInTheDocument();
      });
    });

    it('ينتقل للأرشيف عند النقر على مستند', async () => {
      const user = userEvent.setup();
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('عقد إيجار - عمارة الرياض.pdf')).toBeInTheDocument();
      });

      const docItem = screen.getByText('عقد إيجار - عمارة الرياض.pdf').closest('div[class*="border"]');
      if (docItem) {
        await user.click(docItem);
      }

      expect(mockNavigate).toHaveBeenCalledWith('/archive');
    });
  });

  describe('الإجراءات السريعة', () => {
    it('يعرض زر رفع مستند', async () => {
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /رفع مستند/i })).toBeInTheDocument();
      });
    });

    it('يعرض زر إنشاء مجلد', async () => {
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /إنشاء مجلد/i })).toBeInTheDocument();
      });
    });

    it('يعرض زر البحث المتقدم', async () => {
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /البحث المتقدم/i })).toBeInTheDocument();
      });
    });

    it('ينتقل للأرشيف عند النقر على رفع مستند', async () => {
      const user = userEvent.setup();
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /رفع مستند/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /رفع مستند/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/archive');
    });
  });

  describe('التحديث', () => {
    it('يعرض مؤشر آخر تحديث', async () => {
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('last-sync')).toBeInTheDocument();
      });
    });

    it('يعرض زر التحديث', async () => {
      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        // زر RefreshCw
        const refreshBtn = screen.getByRole('button', { name: '' }); // icon button
        expect(refreshBtn).toBeInTheDocument();
      });
    });
  });

  describe('حالة عدم وجود مستندات', () => {
    it('يعرض رسالة عند عدم وجود مستندات', async () => {
      const { useArchivistDashboard } = await import('@/hooks/archive');
      vi.mocked(useArchivistDashboard).mockReturnValue({
        stats: { totalFolders: 0, totalDocuments: 0, todayUploads: 0, totalSize: '0 MB' },
        statsLoading: false,
        recentDocuments: [],
        docsLoading: false,
      } as any);

      render(<ArchivistDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('لا توجد مستندات')).toBeInTheDocument();
      });
    });
  });
});
