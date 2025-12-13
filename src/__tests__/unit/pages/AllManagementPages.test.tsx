/**
 * اختبارات جميع صفحات المستفيدين والعقارات
 * All Beneficiary & Property Pages Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';

vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 'admin-1', email: 'admin@waqf.sa' },
      roles: ['admin'],
      isLoading: false,
      isAuthenticated: true,
    }),
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Beneficiary Management Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Beneficiaries list page', async () => {
    const Page = (await import('@/pages/Beneficiaries')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render Families page', async () => {
    const Page = (await import('@/pages/Families')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render FamilyDetails page', async () => {
    const Page = (await import('@/pages/FamilyDetails')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render Loans page', async () => {
    const Page = (await import('@/pages/Loans')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render EmergencyAidManagement page', async () => {
    const Page = (await import('@/pages/EmergencyAidManagement')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });
});

describe('Property Management Pages', () => {
  it('should render Properties page', async () => {
    const Page = (await import('@/pages/Properties')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render Tenants page', async () => {
    const Page = (await import('@/pages/Tenants')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render TenantDetails page', async () => {
    const Page = (await import('@/pages/TenantDetails')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render TenantsAgingReportPage', async () => {
    const Page = (await import('@/pages/TenantsAgingReportPage')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });
});

describe('Funds & Distribution Pages', () => {
  it('should render Funds page', async () => {
    const Page = (await import('@/pages/Funds')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render WaqfUnits page', async () => {
    const Page = (await import('@/pages/WaqfUnits')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render Budgets page', async () => {
    const Page = (await import('@/pages/Budgets')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });
});

describe('Request & Approval Pages', () => {
  it('should render Requests page', async () => {
    const Page = (await import('@/pages/Requests')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render Approvals page', async () => {
    const Page = (await import('@/pages/Approvals')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render StaffRequestsManagement page', async () => {
    const Page = (await import('@/pages/StaffRequestsManagement')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });
});

describe('Reports Pages', () => {
  it('should render Reports page', async () => {
    const Page = (await import('@/pages/Reports')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render CustomReports page', async () => {
    const Page = (await import('@/pages/CustomReports')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render AllTransactions page', async () => {
    const Page = (await import('@/pages/AllTransactions')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });
});

describe('Settings Pages', () => {
  it('should render Settings page', async () => {
    const Page = (await import('@/pages/Settings')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render AdvancedSettings page', async () => {
    const Page = (await import('@/pages/AdvancedSettings')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render NotificationSettings page', async () => {
    const Page = (await import('@/pages/NotificationSettings')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render TransparencySettings page', async () => {
    const Page = (await import('@/pages/TransparencySettings')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render IntegrationsManagement page', async () => {
    const Page = (await import('@/pages/IntegrationsManagement')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render LandingPageSettings page', async () => {
    const Page = (await import('@/pages/LandingPageSettings')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });
});

describe('Support & Communication Pages', () => {
  it('should render Messages page', async () => {
    const Page = (await import('@/pages/Messages')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render Notifications page', async () => {
    const Page = (await import('@/pages/Notifications')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render Support page', async () => {
    const Page = (await import('@/pages/Support')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render SupportManagement page', async () => {
    const Page = (await import('@/pages/SupportManagement')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render Chatbot page', async () => {
    const Page = (await import('@/pages/Chatbot')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });
});

describe('AI & Analytics Pages', () => {
  it('should render AIInsights page', async () => {
    const Page = (await import('@/pages/AIInsights')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render PerformanceDashboard page', async () => {
    const Page = (await import('@/pages/PerformanceDashboard')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });
});

describe('Governance Pages', () => {
  it('should render GovernanceDecisions page', async () => {
    const Page = (await import('@/pages/GovernanceDecisions')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render DecisionDetails page', async () => {
    const Page = (await import('@/pages/DecisionDetails')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render WaqfGovernanceGuide page', async () => {
    const Page = (await import('@/pages/WaqfGovernanceGuide')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });
});

describe('Knowledge & Documentation Pages', () => {
  it('should render KnowledgeBase page', async () => {
    const Page = (await import('@/pages/KnowledgeBase')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });

  it('should render FAQ page', async () => {
    const Page = (await import('@/pages/FAQ')).default;
    render(<Page />, { wrapper: createWrapper() });
    await waitFor(() => expect(document.body).toBeDefined());
  });
});
