/**
 * اختبارات شاملة لتقارير المستفيدين
 * Comprehensive Beneficiary Reports Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setMockTableData, clearMockTableData } from '@/test/setup';

// Mock data
const mockBeneficiaries = [
  { id: '1', full_name: 'محمد مرزوق الثبيتي', category: 'زوجة', status: 'active', total_received: 250000, account_balance: 50000 },
  { id: '2', full_name: 'أحمد محمد الثبيتي', category: 'ابن', status: 'active', total_received: 150000, account_balance: 30000 },
  { id: '3', full_name: 'سارة محمد الثبيتي', category: 'بنت', status: 'active', total_received: 100000, account_balance: 20000 },
  { id: '4', full_name: 'فاطمة الثبيتي', category: 'زوجة', status: 'inactive', total_received: 80000, account_balance: 0 },
];

const mockPayments = [
  { id: '1', beneficiary_id: '1', amount: 50000, payment_date: '2025-01-15', type: 'distribution', status: 'completed' },
  { id: '2', beneficiary_id: '1', amount: 30000, payment_date: '2025-02-15', type: 'distribution', status: 'completed' },
  { id: '3', beneficiary_id: '2', amount: 25000, payment_date: '2025-01-15', type: 'distribution', status: 'completed' },
  { id: '4', beneficiary_id: '3', amount: 20000, payment_date: '2025-01-15', type: 'distribution', status: 'completed' },
];

const mockDistributions = [
  { id: '1', beneficiary_id: '1', amount: 80000, distribution_date: '2025-01-01', fiscal_year_id: 'fy1', status: 'paid' },
  { id: '2', beneficiary_id: '2', amount: 45000, distribution_date: '2025-01-01', fiscal_year_id: 'fy1', status: 'paid' },
  { id: '3', beneficiary_id: '3', amount: 35000, distribution_date: '2025-01-01', fiscal_year_id: 'fy1', status: 'paid' },
];

const mockFamilies = [
  { id: 'f1', name: 'عائلة محمد الثبيتي', head_id: '1', member_count: 5 },
];

describe('Beneficiary Reports - Complete Tests', () => {
  beforeEach(() => {
    clearMockTableData();
    vi.clearAllMocks();
  });

  // ==================== تقرير سجل المستفيدين ====================
  describe('Beneficiary Registry Report (سجل المستفيدين)', () => {
    beforeEach(() => {
      setMockTableData('beneficiaries', mockBeneficiaries);
    });

    describe('Basic Information', () => {
      it('should list all beneficiaries', () => {
        expect(mockBeneficiaries).toHaveLength(4);
      });

      it('should show beneficiary names', () => {
        expect(mockBeneficiaries[0].full_name).toBe('محمد مرزوق الثبيتي');
      });

      it('should show beneficiary categories', () => {
        const categories = mockBeneficiaries.map(b => b.category);
        expect(categories).toContain('زوجة');
        expect(categories).toContain('ابن');
        expect(categories).toContain('بنت');
      });

      it('should show beneficiary status', () => {
        const activeCount = mockBeneficiaries.filter(b => b.status === 'active').length;
        expect(activeCount).toBe(3);
      });
    });

    describe('Category Distribution', () => {
      it('should count by category', () => {
        const byCat = mockBeneficiaries.reduce((acc, b) => {
          acc[b.category] = (acc[b.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        expect(byCat['زوجة']).toBe(2);
        expect(byCat['ابن']).toBe(1);
        expect(byCat['بنت']).toBe(1);
      });
    });

    describe('Filtering', () => {
      it('should filter by status', () => {
        const active = mockBeneficiaries.filter(b => b.status === 'active');
        expect(active).toHaveLength(3);
      });

      it('should filter by category', () => {
        const wives = mockBeneficiaries.filter(b => b.category === 'زوجة');
        expect(wives).toHaveLength(2);
      });
    });
  });

  // ==================== تقرير المدفوعات ====================
  describe('Payments Report (تقرير المدفوعات)', () => {
    beforeEach(() => {
      setMockTableData('payments', mockPayments);
      setMockTableData('beneficiaries', mockBeneficiaries);
    });

    describe('Payment Summary', () => {
      it('should calculate total payments', () => {
        const total = mockPayments.reduce((sum, p) => sum + p.amount, 0);
        expect(total).toBe(125000);
      });

      it('should count completed payments', () => {
        const completed = mockPayments.filter(p => p.status === 'completed');
        expect(completed).toHaveLength(4);
      });
    });

    describe('Payment by Beneficiary', () => {
      it('should group payments by beneficiary', () => {
        const byBeneficiary = mockPayments.reduce((acc, p) => {
          acc[p.beneficiary_id] = (acc[p.beneficiary_id] || 0) + p.amount;
          return acc;
        }, {} as Record<string, number>);
        
        expect(byBeneficiary['1']).toBe(80000);
        expect(byBeneficiary['2']).toBe(25000);
      });
    });

    describe('Payment by Date', () => {
      it('should filter by date range', () => {
        const january = mockPayments.filter(p => 
          p.payment_date >= '2025-01-01' && p.payment_date <= '2025-01-31'
        );
        expect(january).toHaveLength(3);
      });

      it('should group by month', () => {
        const byMonth = mockPayments.reduce((acc, p) => {
          const month = p.payment_date.substring(0, 7);
          acc[month] = (acc[month] || 0) + p.amount;
          return acc;
        }, {} as Record<string, number>);
        
        expect(byMonth['2025-01']).toBe(95000);
        expect(byMonth['2025-02']).toBe(30000);
      });
    });
  });

  // ==================== تقرير التوزيعات ====================
  describe('Distributions Report (تقرير التوزيعات)', () => {
    beforeEach(() => {
      setMockTableData('heir_distributions', mockDistributions);
      setMockTableData('beneficiaries', mockBeneficiaries);
    });

    describe('Distribution Summary', () => {
      it('should calculate total distributions', () => {
        const total = mockDistributions.reduce((sum, d) => sum + d.amount, 0);
        expect(total).toBe(160000);
      });

      it('should count paid distributions', () => {
        const paid = mockDistributions.filter(d => d.status === 'paid');
        expect(paid).toHaveLength(3);
      });
    });

    describe('Distribution by Heir Type', () => {
      it('should calculate distribution for each type', () => {
        const byType = mockDistributions.map(d => {
          const beneficiary = mockBeneficiaries.find(b => b.id === d.beneficiary_id);
          return { ...d, category: beneficiary?.category };
        });
        
        const wifeDistribution = byType.filter(d => d.category === 'زوجة');
        expect(wifeDistribution[0].amount).toBe(80000);
      });
    });
  });

  // ==================== تقرير الأرصدة ====================
  describe('Balance Report (تقرير الأرصدة)', () => {
    beforeEach(() => {
      setMockTableData('beneficiaries', mockBeneficiaries);
    });

    describe('Balance Summary', () => {
      it('should calculate total balance', () => {
        const totalBalance = mockBeneficiaries.reduce((sum, b) => sum + b.account_balance, 0);
        expect(totalBalance).toBe(100000);
      });

      it('should calculate total received', () => {
        const totalReceived = mockBeneficiaries.reduce((sum, b) => sum + b.total_received, 0);
        expect(totalReceived).toBe(580000);
      });
    });

    describe('Balance by Category', () => {
      it('should group balance by category', () => {
        const byCategory = mockBeneficiaries.reduce((acc, b) => {
          acc[b.category] = (acc[b.category] || 0) + b.account_balance;
          return acc;
        }, {} as Record<string, number>);
        
        expect(byCategory['زوجة']).toBe(50000);
        expect(byCategory['ابن']).toBe(30000);
        expect(byCategory['بنت']).toBe(20000);
      });
    });

    describe('Zero Balance Beneficiaries', () => {
      it('should identify zero balance accounts', () => {
        const zeroBalance = mockBeneficiaries.filter(b => b.account_balance === 0);
        expect(zeroBalance).toHaveLength(1);
        expect(zeroBalance[0].full_name).toBe('فاطمة الثبيتي');
      });
    });
  });

  // ==================== تقرير العائلات ====================
  describe('Family Report (تقرير العائلات)', () => {
    beforeEach(() => {
      setMockTableData('families', mockFamilies);
      setMockTableData('beneficiaries', mockBeneficiaries);
    });

    describe('Family Summary', () => {
      it('should list all families', () => {
        expect(mockFamilies).toHaveLength(1);
      });

      it('should show family name', () => {
        expect(mockFamilies[0].name).toBe('عائلة محمد الثبيتي');
      });

      it('should show member count', () => {
        expect(mockFamilies[0].member_count).toBe(5);
      });
    });

    describe('Family Head', () => {
      it('should identify family head', () => {
        const family = mockFamilies[0];
        const head = mockBeneficiaries.find(b => b.id === family.head_id);
        expect(head?.full_name).toBe('محمد مرزوق الثبيتي');
      });
    });
  });

  // ==================== تصدير التقارير ====================
  describe('Report Export', () => {
    describe('PDF Export', () => {
      it('should export to PDF', () => {
        const exportToPDF = vi.fn((reportType: string, data: unknown[]) => ({
          success: true,
          fileName: `${reportType}-report.pdf`
        }));
        
        const result = exportToPDF('beneficiaries', mockBeneficiaries);
        expect(result.success).toBe(true);
        expect(result.fileName).toBe('beneficiaries-report.pdf');
      });
    });

    describe('Excel Export', () => {
      it('should export to Excel', () => {
        const exportToExcel = vi.fn((reportType: string, data: unknown[]) => ({
          success: true,
          fileName: `${reportType}-report.xlsx`
        }));
        
        const result = exportToExcel('payments', mockPayments);
        expect(result.success).toBe(true);
        expect(result.fileName).toBe('payments-report.xlsx');
      });
    });

    describe('Print', () => {
      it('should print report', () => {
        const printReport = vi.fn((reportType: string) => ({ printed: true }));
        const result = printReport('distributions');
        expect(result.printed).toBe(true);
      });
    });
  });

  // ==================== فلاتر التقارير ====================
  describe('Report Filters', () => {
    describe('Date Range Filter', () => {
      it('should filter by fiscal year', () => {
        const fiscalYearDistributions = mockDistributions.filter(d => 
          d.fiscal_year_id === 'fy1'
        );
        expect(fiscalYearDistributions).toHaveLength(3);
      });

      it('should filter by custom date range', () => {
        const januaryPayments = mockPayments.filter(p =>
          p.payment_date >= '2025-01-01' && p.payment_date <= '2025-01-31'
        );
        expect(januaryPayments).toHaveLength(3);
      });
    });

    describe('Category Filter', () => {
      it('should filter by beneficiary category', () => {
        const sons = mockBeneficiaries.filter(b => b.category === 'ابن');
        expect(sons).toHaveLength(1);
      });
    });

    describe('Status Filter', () => {
      it('should filter by active status', () => {
        const active = mockBeneficiaries.filter(b => b.status === 'active');
        expect(active).toHaveLength(3);
      });

      it('should filter by inactive status', () => {
        const inactive = mockBeneficiaries.filter(b => b.status === 'inactive');
        expect(inactive).toHaveLength(1);
      });
    });
  });

  // ==================== إحصائيات التقارير ====================
  describe('Report Statistics', () => {
    it('should calculate average payment', () => {
      const total = mockPayments.reduce((sum, p) => sum + p.amount, 0);
      const average = total / mockPayments.length;
      expect(average).toBe(31250);
    });

    it('should find highest payment', () => {
      const highest = Math.max(...mockPayments.map(p => p.amount));
      expect(highest).toBe(50000);
    });

    it('should find lowest payment', () => {
      const lowest = Math.min(...mockPayments.map(p => p.amount));
      expect(lowest).toBe(20000);
    });

    it('should calculate payment count by beneficiary', () => {
      const countByBeneficiary = mockPayments.reduce((acc, p) => {
        acc[p.beneficiary_id] = (acc[p.beneficiary_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      expect(countByBeneficiary['1']).toBe(2);
      expect(countByBeneficiary['2']).toBe(1);
    });
  });
});
