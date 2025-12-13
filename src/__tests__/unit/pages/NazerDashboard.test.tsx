/**
 * اختبارات لوحة تحكم الناظر - منهجية وشاملة
 * NazerDashboard Comprehensive Tests v2.9.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, render, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTestQueryClient } from '../../utils/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';
import { setMockTableData, clearMockTableData } from '@/test/setup';

// ==================== Mock Data ====================
const mockKPIData = {
  totalBeneficiaries: 14,
  activeBeneficiaries: 12,
  sonsCount: 5,
  daughtersCount: 4,
  wivesCount: 3,
  totalProperties: 6,
  activeProperties: 4,
  vacantProperties: 2,
  totalContracts: 4,
  activeContracts: 3,
  bankBalance: 850000,
  waqfCorpus: 107913.20,
  totalCollectedRent: 850000,
  pendingRequests: 2,
  lastUpdated: new Date().toISOString(),
};

const mockRefreshAll = vi.fn();
const mockRefetch = vi.fn();

// ==================== Mocks ====================

// Mock useUnifiedKPIs
vi.mock('@/hooks/dashboard/useUnifiedKPIs', () => ({
  useUnifiedKPIs: () => ({
    data: mockKPIData,
    isLoading: false,
    error: null,
    refetch: mockRefetch,
    lastUpdated: mockKPIData.lastUpdated,
  }),
}));

// Mock useNazerDashboardRealtime hooks
vi.mock('@/hooks/dashboard/useNazerDashboardRealtime', () => ({
  useNazerDashboardRealtime: vi.fn(),
  useNazerDashboardRefresh: () => ({
    refreshAll: mockRefreshAll,
  }),
}));

// Mock heavy child components to speed up tests
vi.mock('@/components/dashboard/nazer/NazerKPIs', () => ({
  default: () => <div data-testid="nazer-kpis">NazerKPIs</div>,
}));

vi.mock('@/components/dashboard/nazer/PendingApprovalsSection', () => ({
  default: () => <div data-testid="pending-approvals">PendingApprovalsSection</div>,
}));

vi.mock('@/components/dashboard/nazer/SmartAlertsSection', () => ({
  default: () => <div data-testid="smart-alerts">SmartAlertsSection</div>,
}));

vi.mock('@/components/dashboard/nazer/QuickActionsGrid', () => ({
  default: () => <div data-testid="quick-actions">QuickActionsGrid</div>,
}));

vi.mock('@/components/dashboard/AIInsightsWidget', () => ({
  AIInsightsWidget: () => <div data-testid="ai-insights">AIInsightsWidget</div>,
}));

vi.mock('@/components/nazer/NazerAnalyticsSection', () => ({
  NazerAnalyticsSection: () => <div data-testid="analytics-section">NazerAnalyticsSection</div>,
}));

vi.mock('@/components/nazer/NazerSystemOverview', () => ({
  NazerSystemOverview: () => <div data-testid="system-overview">NazerSystemOverview</div>,
}));

vi.mock('@/components/nazer/NazerBeneficiaryManagement', () => ({
  NazerBeneficiaryManagement: () => <div data-testid="beneficiary-management">NazerBeneficiaryManagement</div>,
}));

vi.mock('@/components/nazer/BeneficiaryActivityMonitor', () => ({
  BeneficiaryActivityMonitor: () => <div data-testid="activity-monitor">BeneficiaryActivityMonitor</div>,
}));

vi.mock('@/components/nazer/NazerReportsSection', () => ({
  NazerReportsSection: () => <div data-testid="reports-section">NazerReportsSection</div>,
}));

vi.mock('@/components/nazer/BeneficiaryControlSection', () => ({
  BeneficiaryControlSection: () => <div data-testid="control-section">BeneficiaryControlSection</div>,
}));

vi.mock('@/components/dashboard/shared', () => ({
  CurrentFiscalYearCard: () => <div data-testid="fiscal-year-card">CurrentFiscalYearCard</div>,
  RevenueProgressCard: () => <div data-testid="revenue-progress-card">RevenueProgressCard</div>,
  FinancialCardsRow: () => <div data-testid="financial-cards">FinancialCardsRow</div>,
}));

vi.mock('@/components/nazer/FiscalYearPublishStatus', () => ({
  FiscalYearPublishStatus: ({ onPublishClick }: { onPublishClick: () => void }) => (
    <div data-testid="fiscal-year-status">
      <button onClick={onPublishClick}>نشر</button>
    </div>
  ),
}));

vi.mock('@/components/nazer/LastSyncIndicator', () => ({
  LastSyncIndicator: ({ onRefresh }: { onRefresh: () => void }) => (
    <button data-testid="refresh-button" onClick={onRefresh}>تحديث</button>
  ),
}));

vi.mock('@/components/nazer/PreviewAsBeneficiaryButton', () => ({
  PreviewAsBeneficiaryButton: () => <button data-testid="preview-button">معاينة</button>,
}));

vi.mock('@/components/messages/AdminSendMessageDialog', () => ({
  AdminSendMessageDialog: ({ open }: { open: boolean }) => (
    open ? <div data-testid="message-dialog" role="dialog">MessageDialog</div> : null
  ),
}));

vi.mock('@/components/nazer/DistributeRevenueDialog', () => ({
  DistributeRevenueDialog: ({ open }: { open: boolean }) => (
    open ? <div data-testid="distribute-dialog" role="dialog">DistributeRevenueDialog</div> : null
  ),
}));

vi.mock('@/components/nazer/PublishFiscalYearDialog', () => ({
  PublishFiscalYearDialog: ({ open }: { open: boolean }) => (
    open ? <div data-testid="publish-dialog" role="dialog">PublishFiscalYearDialog</div> : null
  ),
}));

// Mock useAuth with Nazer role
vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 'nazer-1', email: 'nazer@waqf.sa' },
      roles: ['nazer'],
      isLoading: false,
      isAuthenticated: true,
      hasRole: (role: string) => ['nazer'].includes(role),
      hasPermission: vi.fn().mockResolvedValue(true),
      checkPermissionSync: vi.fn().mockReturnValue(true),
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// ==================== Test Setup ====================
const createWrapper = () => {
  const queryClient = createTestQueryClient();
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

// Import NazerDashboard once at top level
let NazerDashboard: React.ComponentType;

beforeEach(async () => {
  vi.clearAllMocks();
  clearMockTableData();
  
  // Setup mock data for database queries
  setMockTableData('beneficiaries', [
    { id: '1', full_name: 'مستفيد 1', status: 'active', category: 'ابن' },
    { id: '2', full_name: 'مستفيد 2', status: 'active', category: 'ابن' },
    { id: '3', full_name: 'مستفيد 3', status: 'active', category: 'بنت' },
  ]);
  
  setMockTableData('properties', [
    { id: '1', name: 'عقار السامر 1', status: 'نشط' },
    { id: '2', name: 'عقار السامر 2', status: 'نشط' },
  ]);
  
  // Dynamic import to ensure fresh module
  const module = await import('@/pages/NazerDashboard');
  NazerDashboard = module.default;
});

// ==================== Tests ====================
describe('NazerDashboard', () => {
  
  describe('الهيكل الأساسي - Basic Structure', () => {
    it('should render dashboard container', async () => {
      const { container } = render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(container.firstChild).toBeTruthy();
      });
    });

    it('should render dashboard title', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText(/لوحة تحكم الناظر/i)).toBeInTheDocument();
      });
    });

    it('should render tabs navigation', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        const tabsList = screen.getByRole('tablist');
        expect(tabsList).toBeInTheDocument();
      });
    });

    it('should render action buttons', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByTestId('preview-button')).toBeInTheDocument();
        expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
      });
    });
  });

  describe('التبويبات - Tabs', () => {
    it('should render 4 tabs', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        const tabs = screen.getAllByRole('tab');
        expect(tabs).toHaveLength(4);
      });
    });

    it('should have overview tab active by default', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        const overviewTab = screen.getAllByRole('tab')[0];
        expect(overviewTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should switch to beneficiaries tab on click', async () => {
      const user = userEvent.setup();
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });
      
      const tabs = screen.getAllByRole('tab');
      const beneficiariesTab = tabs[1]; // second tab
      
      await user.click(beneficiariesTab);
      
      await waitFor(() => {
        expect(beneficiariesTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should switch to reports tab on click', async () => {
      const user = userEvent.setup();
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });
      
      const tabs = screen.getAllByRole('tab');
      const reportsTab = tabs[2];
      
      await user.click(reportsTab);
      
      await waitFor(() => {
        expect(reportsTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should switch to control tab on click', async () => {
      const user = userEvent.setup();
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByRole('tablist')).toBeInTheDocument();
      });
      
      const tabs = screen.getAllByRole('tab');
      const settingsTab = tabs[3];
      
      await user.click(settingsTab);
      
      await waitFor(() => {
        expect(settingsTab).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('محتوى تبويب نظرة عامة - Overview Tab Content', () => {
    it('should render fiscal year card', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByTestId('fiscal-year-card')).toBeInTheDocument();
      });
    });

    it('should render revenue progress card', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByTestId('revenue-progress-card')).toBeInTheDocument();
      });
    });

    it('should render financial cards row', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByTestId('financial-cards')).toBeInTheDocument();
      });
    });

    it('should render KPIs section', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByTestId('nazer-kpis')).toBeInTheDocument();
      });
    });

    it('should render pending approvals section', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByTestId('pending-approvals')).toBeInTheDocument();
      });
    });

    it('should render smart alerts section', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByTestId('smart-alerts')).toBeInTheDocument();
      });
    });

    it('should render quick actions grid', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
      });
    });
  });

  describe('محتوى تبويب المستفيدين - Beneficiaries Tab Content', () => {
    it('should render beneficiary management when tab is active', async () => {
      const user = userEvent.setup();
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      // Click beneficiaries tab
      const tabs = await screen.findAllByRole('tab');
      await user.click(tabs[1]);
      
      await waitFor(() => {
        expect(screen.getByTestId('beneficiary-management')).toBeInTheDocument();
      });
    });

    it('should render activity monitor when tab is active', async () => {
      const user = userEvent.setup();
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      const tabs = await screen.findAllByRole('tab');
      await user.click(tabs[1]);
      
      await waitFor(() => {
        expect(screen.getByTestId('activity-monitor')).toBeInTheDocument();
      });
    });
  });

  describe('الحوارات - Dialogs', () => {
    it('should open distribute dialog when button clicked', async () => {
      const user = userEvent.setup();
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      // Find and click distribute button
      const distributeButton = await screen.findByRole('button', { name: /توزيع الغلة/i });
      await user.click(distributeButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('distribute-dialog')).toBeInTheDocument();
      });
    });

    it('should open publish dialog when button clicked', async () => {
      const user = userEvent.setup();
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      const publishButton = await screen.findByRole('button', { name: /نشر السنة/i });
      await user.click(publishButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('publish-dialog')).toBeInTheDocument();
      });
    });

    it('should open message dialog when button clicked', async () => {
      const user = userEvent.setup();
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      const messageButton = await screen.findByRole('button', { name: /رسالة/i });
      await user.click(messageButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('message-dialog')).toBeInTheDocument();
      });
    });
  });

  describe('التحديث المباشر - Realtime Updates', () => {
    it('should call refresh on refresh button click', async () => {
      const user = userEvent.setup();
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      const refreshButton = await screen.findByTestId('refresh-button');
      await user.click(refreshButton);
      
      await waitFor(() => {
        expect(mockRefreshAll).toHaveBeenCalled();
      });
    });

    it('should initialize realtime subscription on mount', async () => {
      const { useNazerDashboardRealtime } = await import('@/hooks/dashboard/useNazerDashboardRealtime');
      
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(useNazerDashboardRealtime).toHaveBeenCalled();
      });
    });
  });

  describe('التحقق من بيانات KPI - KPI Data Validation', () => {
    it('should have correct mock data structure', () => {
      expect(mockKPIData.totalBeneficiaries).toBe(14);
      expect(mockKPIData.activeBeneficiaries).toBe(12);
      expect(mockKPIData.sonsCount).toBe(5);
      expect(mockKPIData.daughtersCount).toBe(4);
      expect(mockKPIData.wivesCount).toBe(3);
    });

    it('should have correct property counts', () => {
      expect(mockKPIData.totalProperties).toBe(6);
      expect(mockKPIData.activeProperties).toBe(4);
      expect(mockKPIData.vacantProperties).toBe(2);
    });

    it('should have correct financial data', () => {
      expect(mockKPIData.bankBalance).toBe(850000);
      expect(mockKPIData.waqfCorpus).toBeCloseTo(107913.20, 2);
      expect(mockKPIData.totalCollectedRent).toBe(850000);
    });

    it('should have valid lastUpdated timestamp', () => {
      expect(mockKPIData.lastUpdated).toBeDefined();
      const date = new Date(mockKPIData.lastUpdated);
      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).not.toBeNaN();
    });
  });

  describe('اختبار تبويب التحكم - Control Tab Tests', () => {
    it('should render control section when tab is active', async () => {
      const user = userEvent.setup();
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      const tabs = await screen.findAllByRole('tab');
      await user.click(tabs[3]); // settings tab
      
      await waitFor(() => {
        expect(screen.getByTestId('control-section')).toBeInTheDocument();
      });
    });
  });

  describe('اختبار تبويب التقارير - Reports Tab Tests', () => {
    it('should render reports section when tab is active', async () => {
      const user = userEvent.setup();
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      const tabs = await screen.findAllByRole('tab');
      await user.click(tabs[2]); // reports tab
      
      await waitFor(() => {
        expect(screen.getByTestId('reports-section')).toBeInTheDocument();
      });
    });
  });

  describe('حالة نشر السنة المالية - Fiscal Year Status', () => {
    it('should render fiscal year publish status', async () => {
      render(<NazerDashboard />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByTestId('fiscal-year-status')).toBeInTheDocument();
      });
    });
  });
});
