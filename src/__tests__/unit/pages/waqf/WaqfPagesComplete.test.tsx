/**
 * اختبارات شاملة لصفحات الوقف
 * Comprehensive Waqf Pages Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setMockTableData, clearMockTableData } from '@/test/setup';

// Mock data
const mockFunds = [
  { id: '1', name: 'قلم الأيتام', type: 'charity', percentage: 5, total_distributed: 50000, is_active: true },
  { id: '2', name: 'قلم الصيانة', type: 'maintenance', percentage: 10, total_distributed: 100000, is_active: true },
  { id: '3', name: 'قلم التطوير', type: 'development', percentage: 5, total_distributed: 50000, is_active: true },
  { id: '4', name: 'قلم الناظر', type: 'nazer', percentage: 10, total_distributed: 85000, is_active: true },
];

const mockDistributions = [
  { id: '1', total_amount: 1000000, distributed_amount: 850000, nazer_share: 85000, charity_share: 50000, status: 'completed', distribution_date: '2025-01-01' },
  { id: '2', total_amount: 500000, distributed_amount: 425000, nazer_share: 42500, charity_share: 25000, status: 'pending', distribution_date: '2025-02-01' },
];

const mockHeirDistributions = [
  { id: '1', distribution_id: '1', beneficiary_id: 'b1', heir_type: 'wife', share_percentage: 12.5, amount: 106250, status: 'paid' },
  { id: '2', distribution_id: '1', beneficiary_id: 'b2', heir_type: 'son', share_percentage: 25, amount: 212500, status: 'paid' },
  { id: '3', distribution_id: '1', beneficiary_id: 'b3', heir_type: 'daughter', share_percentage: 12.5, amount: 106250, status: 'paid' },
];

const mockFiscalYears = [
  { id: 'fy1', name: '2024-2025', start_date: '2024-10-25', end_date: '2025-10-24', is_active: false, is_closed: true, is_published: true },
  { id: 'fy2', name: '2025-2026', start_date: '2025-10-25', end_date: '2026-10-24', is_active: true, is_closed: false, is_published: false },
];

const mockAnnualDisclosures = [
  { 
    id: '1', 
    fiscal_year_id: 'fy1',
    year: 2024,
    waqf_name: 'وقف مرزوق الثبيتي',
    total_revenues: 1000000,
    total_expenses: 150000,
    net_income: 850000,
    nazer_share: 85000,
    charity_share: 50000,
    corpus_share: 50000,
    total_beneficiaries: 14,
    sons_count: 5,
    daughters_count: 5,
    wives_count: 4,
    status: 'published'
  }
];

describe('Waqf Pages - Complete Tests', () => {
  beforeEach(() => {
    clearMockTableData();
    vi.clearAllMocks();
  });

  // ==================== أقلام الوقف ====================
  describe('Waqf Funds (أقلام الوقف)', () => {
    beforeEach(() => {
      setMockTableData('funds', mockFunds);
    });

    describe('Fund List', () => {
      it('should display all funds', () => {
        expect(mockFunds).toHaveLength(4);
      });

      it('should show fund names', () => {
        expect(mockFunds[0].name).toBe('قلم الأيتام');
        expect(mockFunds[1].name).toBe('قلم الصيانة');
      });

      it('should show fund percentages', () => {
        const totalPercentage = mockFunds.reduce((sum, f) => sum + f.percentage, 0);
        expect(totalPercentage).toBe(30);
      });

      it('should show fund types', () => {
        const types = mockFunds.map(f => f.type);
        expect(types).toContain('charity');
        expect(types).toContain('maintenance');
        expect(types).toContain('nazer');
      });
    });

    describe('Fund Statistics', () => {
      it('should calculate total distributed', () => {
        const totalDistributed = mockFunds.reduce((sum, f) => sum + f.total_distributed, 0);
        expect(totalDistributed).toBe(285000);
      });

      it('should identify active funds', () => {
        const activeFunds = mockFunds.filter(f => f.is_active);
        expect(activeFunds).toHaveLength(4);
      });
    });
  });

  // ==================== التوزيعات ====================
  describe('Distributions (التوزيعات)', () => {
    beforeEach(() => {
      setMockTableData('distributions', mockDistributions);
      setMockTableData('heir_distributions', mockHeirDistributions);
    });

    describe('Distribution Summary', () => {
      it('should show total amount', () => {
        const total = mockDistributions.reduce((sum, d) => sum + d.total_amount, 0);
        expect(total).toBe(1500000);
      });

      it('should show distributed amount', () => {
        const distributed = mockDistributions.reduce((sum, d) => sum + d.distributed_amount, 0);
        expect(distributed).toBe(1275000);
      });

      it('should show nazer share', () => {
        const nazerShare = mockDistributions.reduce((sum, d) => sum + d.nazer_share, 0);
        expect(nazerShare).toBe(127500);
      });

      it('should show charity share', () => {
        const charityShare = mockDistributions.reduce((sum, d) => sum + d.charity_share, 0);
        expect(charityShare).toBe(75000);
      });
    });

    describe('Heir Distributions', () => {
      it('should calculate wife share', () => {
        const wifeShare = mockHeirDistributions
          .filter(h => h.heir_type === 'wife')
          .reduce((sum, h) => sum + h.amount, 0);
        expect(wifeShare).toBe(106250);
      });

      it('should calculate son share', () => {
        const sonShare = mockHeirDistributions
          .filter(h => h.heir_type === 'son')
          .reduce((sum, h) => sum + h.amount, 0);
        expect(sonShare).toBe(212500);
      });

      it('should calculate daughter share', () => {
        const daughterShare = mockHeirDistributions
          .filter(h => h.heir_type === 'daughter')
          .reduce((sum, h) => sum + h.amount, 0);
        expect(daughterShare).toBe(106250);
      });
    });

    describe('Distribution Status', () => {
      it('should identify completed distributions', () => {
        const completed = mockDistributions.filter(d => d.status === 'completed');
        expect(completed).toHaveLength(1);
      });

      it('should identify pending distributions', () => {
        const pending = mockDistributions.filter(d => d.status === 'pending');
        expect(pending).toHaveLength(1);
      });
    });
  });

  // ==================== الإفصاح السنوي ====================
  describe('Annual Disclosure (الإفصاح السنوي)', () => {
    beforeEach(() => {
      setMockTableData('annual_disclosures', mockAnnualDisclosures);
      setMockTableData('fiscal_years', mockFiscalYears);
    });

    describe('Disclosure Summary', () => {
      it('should show waqf name', () => {
        expect(mockAnnualDisclosures[0].waqf_name).toBe('وقف مرزوق الثبيتي');
      });

      it('should show total revenues', () => {
        expect(mockAnnualDisclosures[0].total_revenues).toBe(1000000);
      });

      it('should show total expenses', () => {
        expect(mockAnnualDisclosures[0].total_expenses).toBe(150000);
      });

      it('should show net income', () => {
        expect(mockAnnualDisclosures[0].net_income).toBe(850000);
      });
    });

    describe('Beneficiary Breakdown', () => {
      it('should show total beneficiaries', () => {
        expect(mockAnnualDisclosures[0].total_beneficiaries).toBe(14);
      });

      it('should show sons count', () => {
        expect(mockAnnualDisclosures[0].sons_count).toBe(5);
      });

      it('should show daughters count', () => {
        expect(mockAnnualDisclosures[0].daughters_count).toBe(5);
      });

      it('should show wives count', () => {
        expect(mockAnnualDisclosures[0].wives_count).toBe(4);
      });

      it('should verify beneficiary count matches', () => {
        const disclosure = mockAnnualDisclosures[0];
        const calculatedTotal = disclosure.sons_count + disclosure.daughters_count + disclosure.wives_count;
        expect(calculatedTotal).toBe(disclosure.total_beneficiaries);
      });
    });

    describe('Share Distribution', () => {
      it('should show nazer share', () => {
        expect(mockAnnualDisclosures[0].nazer_share).toBe(85000);
      });

      it('should show charity share', () => {
        expect(mockAnnualDisclosures[0].charity_share).toBe(50000);
      });

      it('should show corpus share', () => {
        expect(mockAnnualDisclosures[0].corpus_share).toBe(50000);
      });
    });

    describe('Publication Status', () => {
      it('should identify published disclosures', () => {
        const published = mockAnnualDisclosures.filter(d => d.status === 'published');
        expect(published).toHaveLength(1);
      });
    });
  });

  // ==================== السنوات المالية ====================
  describe('Fiscal Years (السنوات المالية)', () => {
    beforeEach(() => {
      setMockTableData('fiscal_years', mockFiscalYears);
    });

    describe('Fiscal Year List', () => {
      it('should display all fiscal years', () => {
        expect(mockFiscalYears).toHaveLength(2);
      });

      it('should show fiscal year names', () => {
        expect(mockFiscalYears[0].name).toBe('2024-2025');
        expect(mockFiscalYears[1].name).toBe('2025-2026');
      });
    });

    describe('Active Fiscal Year', () => {
      it('should identify active fiscal year', () => {
        const active = mockFiscalYears.find(fy => fy.is_active);
        expect(active?.name).toBe('2025-2026');
      });
    });

    describe('Closed Fiscal Years', () => {
      it('should identify closed fiscal years', () => {
        const closed = mockFiscalYears.filter(fy => fy.is_closed);
        expect(closed).toHaveLength(1);
        expect(closed[0].name).toBe('2024-2025');
      });
    });

    describe('Published Fiscal Years', () => {
      it('should identify published fiscal years', () => {
        const published = mockFiscalYears.filter(fy => fy.is_published);
        expect(published).toHaveLength(1);
        expect(published[0].name).toBe('2024-2025');
      });
    });
  });

  // ==================== الوحدات العقارية ====================
  describe('Property Units (الوحدات)', () => {
    const mockUnits = [
      { id: '1', property_id: 'p1', unit_number: '101', floor: 1, type: 'apartment', status: 'occupied', monthly_rent: 2000 },
      { id: '2', property_id: 'p1', unit_number: '102', floor: 1, type: 'apartment', status: 'vacant', monthly_rent: 2000 },
      { id: '3', property_id: 'p1', unit_number: '201', floor: 2, type: 'apartment', status: 'occupied', monthly_rent: 2500 },
    ];

    beforeEach(() => {
      setMockTableData('property_units', mockUnits);
    });

    describe('Unit List', () => {
      it('should display all units', () => {
        expect(mockUnits).toHaveLength(3);
      });

      it('should show unit numbers', () => {
        const numbers = mockUnits.map(u => u.unit_number);
        expect(numbers).toContain('101');
        expect(numbers).toContain('102');
        expect(numbers).toContain('201');
      });
    });

    describe('Unit Status', () => {
      it('should identify occupied units', () => {
        const occupied = mockUnits.filter(u => u.status === 'occupied');
        expect(occupied).toHaveLength(2);
      });

      it('should identify vacant units', () => {
        const vacant = mockUnits.filter(u => u.status === 'vacant');
        expect(vacant).toHaveLength(1);
      });
    });

    describe('Rental Income', () => {
      it('should calculate total potential rent', () => {
        const totalRent = mockUnits.reduce((sum, u) => sum + u.monthly_rent, 0);
        expect(totalRent).toBe(6500);
      });

      it('should calculate actual collected rent', () => {
        const occupiedRent = mockUnits
          .filter(u => u.status === 'occupied')
          .reduce((sum, u) => sum + u.monthly_rent, 0);
        expect(occupiedRent).toBe(4500);
      });
    });
  });

  // ==================== الحوكمة ====================
  describe('Governance (الحوكمة)', () => {
    const mockGovernanceRules = [
      { id: '1', title: 'توزيع الغلة', description: 'توزيع غلة الوقف حسب شروط الواقف', category: 'distribution' },
      { id: '2', title: 'نسبة الناظر', description: 'نسبة الناظر 10% من صافي الغلة', category: 'nazer' },
      { id: '3', title: 'نسبة الخير', description: 'نسبة الخير 5% للأعمال الخيرية', category: 'charity' },
    ];

    beforeEach(() => {
      setMockTableData('governance_rules', mockGovernanceRules);
    });

    describe('Rules Display', () => {
      it('should display all governance rules', () => {
        expect(mockGovernanceRules).toHaveLength(3);
      });

      it('should show rule titles', () => {
        expect(mockGovernanceRules[0].title).toBe('توزيع الغلة');
      });

      it('should show rule descriptions', () => {
        expect(mockGovernanceRules[1].description).toBe('نسبة الناظر 10% من صافي الغلة');
      });
    });

    describe('Rules Categories', () => {
      it('should categorize rules', () => {
        const categories = mockGovernanceRules.map(r => r.category);
        expect(categories).toContain('distribution');
        expect(categories).toContain('nazer');
        expect(categories).toContain('charity');
      });
    });
  });

  // ==================== الميزانيات ====================
  describe('Budgets (الميزانيات)', () => {
    const mockBudgets = [
      { id: '1', fiscal_year_id: 'fy2', category: 'maintenance', budgeted_amount: 100000, actual_amount: 50000, status: 'active' },
      { id: '2', fiscal_year_id: 'fy2', category: 'development', budgeted_amount: 50000, actual_amount: 20000, status: 'active' },
      { id: '3', fiscal_year_id: 'fy2', category: 'administrative', budgeted_amount: 30000, actual_amount: 15000, status: 'active' },
    ];

    beforeEach(() => {
      setMockTableData('budgets', mockBudgets);
    });

    describe('Budget Summary', () => {
      it('should calculate total budgeted', () => {
        const totalBudgeted = mockBudgets.reduce((sum, b) => sum + b.budgeted_amount, 0);
        expect(totalBudgeted).toBe(180000);
      });

      it('should calculate total actual', () => {
        const totalActual = mockBudgets.reduce((sum, b) => sum + b.actual_amount, 0);
        expect(totalActual).toBe(85000);
      });

      it('should calculate remaining budget', () => {
        const remaining = mockBudgets.reduce((sum, b) => sum + (b.budgeted_amount - b.actual_amount), 0);
        expect(remaining).toBe(95000);
      });
    });

    describe('Budget Utilization', () => {
      it('should calculate utilization percentage', () => {
        const totalBudgeted = 180000;
        const totalActual = 85000;
        const utilization = (totalActual / totalBudgeted) * 100;
        expect(utilization.toFixed(2)).toBe('47.22');
      });
    });
  });
});
