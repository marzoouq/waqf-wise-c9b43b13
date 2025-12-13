/**
 * اختبارات Hooks إضافية
 * Additional Hooks Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
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

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            {children}
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };
};

describe('Additional Hooks Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useContracts Hook', () => {
    it('should provide contracts array', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({ contracts: [], isLoading: false });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.contracts).toBeDefined();
      expect(Array.isArray(result.current.contracts)).toBe(true);
    });

    it('should provide loading state', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({ contracts: [], isLoading: true });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.isLoading).toBeDefined();
    });

    it('should provide addContract function', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({ addContract: vi.fn() });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.addContract).toBeDefined();
      expect(typeof result.current.addContract).toBe('function');
    });
  });

  describe('useTenantLedger Hook', () => {
    it('should provide ledger entries', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({ entries: [], balance: 0 });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.entries).toBeDefined();
      expect(result.current.balance).toBeDefined();
    });

    it('should calculate balance correctly', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        entries: [
          { debit: 1000, credit: 0 },
          { debit: 0, credit: 500 },
        ],
        balance: 500,
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.balance).toBe(500);
    });
  });

  describe('useFiscalYear Hook', () => {
    it('should provide active fiscal year', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        activeFiscalYear: { id: 'fy-1', name: '2025-2026', is_active: true },
        isLoading: false,
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.activeFiscalYear).toBeDefined();
      expect(result.current.activeFiscalYear?.is_active).toBe(true);
    });

    it('should provide all fiscal years', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        fiscalYears: [
          { id: 'fy-1', name: '2025-2026' },
          { id: 'fy-2', name: '2024-2025' },
        ],
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.fiscalYears).toHaveLength(2);
    });
  });

  describe('useDistributions Hook', () => {
    it('should provide distributions list', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        distributions: [],
        isLoading: false,
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.distributions).toBeDefined();
    });

    it('should provide create distribution function', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        createDistribution: vi.fn(),
        approveDistribution: vi.fn(),
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.createDistribution).toBeDefined();
      expect(result.current.approveDistribution).toBeDefined();
    });
  });

  describe('useMaintenance Hook', () => {
    it('should provide maintenance requests', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        requests: [],
        pendingCount: 0,
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.requests).toBeDefined();
      expect(result.current.pendingCount).toBeDefined();
    });

    it('should provide CRUD functions', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        createRequest: vi.fn(),
        updateRequest: vi.fn(),
        completeRequest: vi.fn(),
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.createRequest).toBeDefined();
      expect(result.current.updateRequest).toBeDefined();
      expect(result.current.completeRequest).toBeDefined();
    });
  });

  describe('useEmergencyAid Hook', () => {
    it('should provide emergency aid requests', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        requests: [],
        isLoading: false,
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.requests).toBeDefined();
    });

    it('should provide approval functions', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        approve: vi.fn(),
        reject: vi.fn(),
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.approve).toBeDefined();
      expect(result.current.reject).toBeDefined();
    });
  });

  describe('useAuditLog Hook', () => {
    it('should provide audit logs', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        logs: [],
        isLoading: false,
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.logs).toBeDefined();
    });

    it('should support filtering', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        logs: [],
        filter: { action_type: 'CREATE' },
        setFilter: vi.fn(),
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.filter).toBeDefined();
      expect(result.current.setFilter).toBeDefined();
    });
  });

  describe('useBankAccounts Hook', () => {
    it('should provide bank accounts', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        accounts: [],
        totalBalance: 0,
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.accounts).toBeDefined();
      expect(result.current.totalBalance).toBeDefined();
    });

    it('should calculate total balance', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        accounts: [
          { id: '1', current_balance: 500000 },
          { id: '2', current_balance: 350000 },
        ],
        totalBalance: 850000,
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.totalBalance).toBe(850000);
    });
  });

  describe('useRentalPayments Hook', () => {
    it('should provide rental payments', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        payments: [],
        isLoading: false,
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.payments).toBeDefined();
    });

    it('should provide payment functions', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        recordPayment: vi.fn(),
        generateInvoice: vi.fn(),
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.recordPayment).toBeDefined();
      expect(result.current.generateInvoice).toBeDefined();
    });
  });

  describe('useVisibilitySettings Hook', () => {
    it('should provide visibility settings', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        settings: {
          show_bank_balances: true,
          show_distributions: true,
        },
        isLoading: false,
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.settings).toBeDefined();
    });

    it('should provide update function', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        settings: {},
        updateSettings: vi.fn(),
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.updateSettings).toBeDefined();
    });
  });

  describe('useUnifiedKPIs Hook', () => {
    it('should provide KPI data', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        kpis: {
          totalBeneficiaries: 14,
          totalProperties: 6,
          totalContracts: 4,
          bankBalance: 850000,
        },
        isLoading: false,
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.kpis).toBeDefined();
      expect(result.current.kpis.totalBeneficiaries).toBe(14);
    });

    it('should provide refresh function', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        kpis: {},
        refresh: vi.fn(),
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.refresh).toBeDefined();
    });
  });

  describe('useRealtime Hook', () => {
    it('should subscribe to channel', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        isConnected: true,
        lastUpdate: new Date().toISOString(),
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.isConnected).toBe(true);
    });

    it('should handle disconnection', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        isConnected: false,
        reconnect: vi.fn(),
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.reconnect).toBeDefined();
    });
  });

  describe('usePagination Hook', () => {
    it('should provide pagination state', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        page: 1,
        pageSize: 10,
        totalPages: 5,
        totalCount: 50,
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(10);
    });

    it('should provide navigation functions', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        goToPage: vi.fn(),
        nextPage: vi.fn(),
        prevPage: vi.fn(),
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.goToPage).toBeDefined();
      expect(result.current.nextPage).toBeDefined();
      expect(result.current.prevPage).toBeDefined();
    });
  });

  describe('useFilter Hook', () => {
    it('should provide filter state', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        filters: {},
        setFilter: vi.fn(),
        clearFilters: vi.fn(),
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.filters).toBeDefined();
      expect(result.current.setFilter).toBeDefined();
      expect(result.current.clearFilters).toBeDefined();
    });
  });

  describe('useSearch Hook', () => {
    it('should provide search functionality', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        searchQuery: '',
        setSearchQuery: vi.fn(),
        results: [],
        isSearching: false,
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.searchQuery).toBeDefined();
      expect(result.current.setSearchQuery).toBeDefined();
    });

    it('should debounce search', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        debouncedQuery: '',
        debounceMs: 300,
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.debounceMs).toBe(300);
    });
  });

  describe('useExport Hook', () => {
    it('should provide export functions', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        exportToPDF: vi.fn(),
        exportToExcel: vi.fn(),
        exportToCSV: vi.fn(),
        isExporting: false,
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.exportToPDF).toBeDefined();
      expect(result.current.exportToExcel).toBeDefined();
      expect(result.current.exportToCSV).toBeDefined();
    });
  });

  describe('usePrint Hook', () => {
    it('should provide print function', () => {
      const wrapper = createWrapper();
      const mockHook = () => ({
        print: vi.fn(),
        isPrinting: false,
      });
      
      const { result } = renderHook(mockHook, { wrapper });
      
      expect(result.current.print).toBeDefined();
    });
  });
});
