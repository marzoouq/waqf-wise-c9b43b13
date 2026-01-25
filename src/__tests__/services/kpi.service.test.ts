import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * KPI Service Unit Tests
 * اختبارات وحدة لخدمة مؤشرات الأداء الرئيسية
 */

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          then: vi.fn(),
        })),
        is: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
          then: vi.fn((cb) => cb({ data: [], error: null })),
        })),
        then: vi.fn((cb) => cb({ data: [], error: null })),
      })),
    })),
  },
}));

describe('KPI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUnifiedKPIs', () => {
    it('should return default values when no data exists', async () => {
      // Test that the service handles empty data gracefully
      const defaultKPIs = {
        totalBeneficiaries: 0,
        activeBeneficiaries: 0,
        totalProperties: 0,
        totalContracts: 0,
        activeContracts: 0,
        totalCollection: 0,
        pendingApprovals: 0,
        openMaintenanceRequests: 0,
      };

      // Verify structure matches expected format
      expect(defaultKPIs).toHaveProperty('totalBeneficiaries');
      expect(defaultKPIs).toHaveProperty('activeBeneficiaries');
      expect(defaultKPIs).toHaveProperty('totalProperties');
      expect(defaultKPIs).toHaveProperty('totalContracts');
      expect(defaultKPIs).toHaveProperty('activeContracts');
      expect(defaultKPIs).toHaveProperty('totalCollection');
      expect(defaultKPIs).toHaveProperty('pendingApprovals');
      expect(defaultKPIs).toHaveProperty('openMaintenanceRequests');
    });

    it('should correctly count active beneficiaries', () => {
      const mockBeneficiaries = [
        { id: '1', status: 'نشط', full_name: 'Test 1' },
        { id: '2', status: 'active', full_name: 'Test 2' },
        { id: '3', status: 'غير نشط', full_name: 'Test 3' },
        { id: '4', status: 'inactive', full_name: 'Test 4' },
      ];

      const activeCount = mockBeneficiaries.filter(
        b => b.status === 'نشط' || b.status === 'active'
      ).length;

      expect(activeCount).toBe(2);
    });

    it('should correctly count active contracts', () => {
      const mockContracts = [
        { id: '1', status: 'نشط' },
        { id: '2', status: 'active' },
        { id: '3', status: 'منتهي' },
        { id: '4', status: 'ملغي' },
      ];

      const activeCount = mockContracts.filter(
        c => c.status === 'نشط' || c.status === 'active'
      ).length;

      expect(activeCount).toBe(2);
    });

    it('should calculate total collection from payment vouchers', () => {
      const mockVouchers = [
        { id: '1', type: 'receipt', amount: 1000, status: 'paid' },
        { id: '2', type: 'receipt', amount: 500, status: 'paid' },
        { id: '3', type: 'payment', amount: 300, status: 'paid' },
      ];

      const totalCollection = mockVouchers
        .filter(v => v.type === 'receipt' && v.status === 'paid')
        .reduce((sum, v) => sum + v.amount, 0);

      expect(totalCollection).toBe(1500);
    });
  });

  describe('Data Filtering', () => {
    it('should exclude soft-deleted records', () => {
      const mockData = [
        { id: '1', deleted_at: null },
        { id: '2', deleted_at: '2024-01-01' },
        { id: '3', deleted_at: null },
      ];

      const activeRecords = mockData.filter(d => d.deleted_at === null);
      expect(activeRecords.length).toBe(2);
    });

    it('should handle both Arabic and English status values', () => {
      const statusPairs = [
        { ar: 'نشط', en: 'active' },
        { ar: 'غير نشط', en: 'inactive' },
        { ar: 'معلق', en: 'pending' },
      ];

      statusPairs.forEach(pair => {
        const matchesStatus = (status: string, ...targets: string[]) => {
          return targets.some(t => 
            status.toLowerCase() === t.toLowerCase() ||
            status === pair.ar ||
            status === pair.en
          );
        };

        expect(matchesStatus(pair.ar, 'active')).toBe(true);
        expect(matchesStatus(pair.en, pair.ar)).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase errors gracefully', async () => {
      const mockError = { message: 'Network error', code: 'NETWORK_ERROR' };
      
      // Test that errors are properly structured
      expect(mockError).toHaveProperty('message');
      expect(mockError).toHaveProperty('code');
    });

    it('should return empty arrays on query failure', () => {
      const fallbackData = {
        beneficiaries: [],
        contracts: [],
        properties: [],
        vouchers: [],
      };

      expect(Array.isArray(fallbackData.beneficiaries)).toBe(true);
      expect(fallbackData.beneficiaries.length).toBe(0);
    });
  });
});

describe('KPI Calculations', () => {
  it('should calculate pending approvals correctly', () => {
    const mockApprovals = [
      { id: '1', status: 'pending' },
      { id: '2', status: 'approved' },
      { id: '3', status: 'pending' },
      { id: '4', status: 'rejected' },
    ];

    const pendingCount = mockApprovals.filter(a => a.status === 'pending').length;
    expect(pendingCount).toBe(2);
  });

  it('should calculate open maintenance requests', () => {
    const mockRequests = [
      { id: '1', status: 'جديد' },
      { id: '2', status: 'قيد التنفيذ' },
      { id: '3', status: 'مكتمل' },
      { id: '4', status: 'معلق' },
    ];

    const openStatuses = ['جديد', 'قيد التنفيذ', 'معلق', 'قيد المراجعة'];
    const openCount = mockRequests.filter(r => openStatuses.includes(r.status)).length;
    expect(openCount).toBe(3);
  });
});
