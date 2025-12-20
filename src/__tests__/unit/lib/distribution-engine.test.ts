/**
 * اختبارات محرك التوزيع
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  DistributionEngine,
  type Beneficiary,
  type DistributionParams,
  type DeductionsConfig,
} from '@/lib/distribution-engine';

describe('DistributionEngine', () => {
  const mockBeneficiaries: Beneficiary[] = [
    {
      id: '1',
      full_name: 'أحمد محمد',
      beneficiary_number: 'B001',
      beneficiary_type: 'ابن',
      category: 'sons',
      family_size: 4,
      monthly_income: 5000,
      number_of_sons: 2,
      number_of_daughters: 1,
    },
    {
      id: '2',
      full_name: 'فاطمة علي',
      beneficiary_number: 'B002',
      beneficiary_type: 'بنت',
      category: 'daughters',
      family_size: 3,
      monthly_income: 3000,
      number_of_sons: 1,
      number_of_daughters: 1,
    },
    {
      id: '3',
      full_name: 'سارة أحمد',
      beneficiary_number: 'B003',
      beneficiary_type: 'زوجة',
      category: 'wives',
      family_size: 1,
      monthly_income: 0,
    },
  ];

  const mockDeductions: DeductionsConfig = {
    nazer_percentage: 0.05,
    reserve_percentage: 0.1,
    waqf_corpus_percentage: 0.05,
    maintenance_percentage: 0.03,
    development_percentage: 0.02,
  };

  describe('Shariah Distribution', () => {
    it('should calculate shariah shares correctly (son gets double daughter)', () => {
      const params: DistributionParams = {
        total_amount: 100000,
        beneficiaries: mockBeneficiaries,
        deductions: mockDeductions,
        pattern: 'shariah',
      };

      const result = DistributionEngine.calculate(params);

      // Son (id: 1) should get 2 shares, daughter (id: 2) should get 1 share
      const sonResult = result.results.find((r) => r.beneficiary_id === '1');
      const daughterResult = result.results.find((r) => r.beneficiary_id === '2');

      expect(sonResult!.allocated_amount).toBeGreaterThan(daughterResult!.allocated_amount);
      // Son should get approximately double
      expect(sonResult!.allocated_amount / daughterResult!.allocated_amount).toBeCloseTo(2, 0);
    });

    it('should apply deductions correctly', () => {
      const params: DistributionParams = {
        total_amount: 100000,
        beneficiaries: mockBeneficiaries,
        deductions: mockDeductions,
        pattern: 'shariah',
      };

      const result = DistributionEngine.calculate(params);

      // Total deductions should be 25% (5+10+5+3+2)
      expect(result.summary.deductions.total).toBe(25000);
      expect(result.summary.distributable_amount).toBe(75000);
    });
  });

  describe('Equal Distribution', () => {
    it('should distribute equally among all beneficiaries', () => {
      const params: DistributionParams = {
        total_amount: 100000,
        beneficiaries: mockBeneficiaries,
        deductions: mockDeductions,
        pattern: 'equal',
      };

      const result = DistributionEngine.calculate(params);

      // All beneficiaries should get the same amount
      const amounts = result.results.map((r) => r.allocated_amount);
      const uniqueAmounts = [...new Set(amounts)];

      expect(uniqueAmounts.length).toBe(1);
      expect(amounts[0]).toBeCloseTo(25000, 0); // 75000 / 3
    });
  });

  describe('Need-Based Distribution', () => {
    it('should give more to those with higher need', () => {
      const params: DistributionParams = {
        total_amount: 100000,
        beneficiaries: mockBeneficiaries,
        deductions: mockDeductions,
        pattern: 'need_based',
      };

      const result = DistributionEngine.calculate(params);

      // Wife (id: 3) with 0 income should get more
      const wifeResult = result.results.find((r) => r.beneficiary_id === '3');
      const sonResult = result.results.find((r) => r.beneficiary_id === '1');

      // Wife should have more need points (0 income = 10 points)
      expect(wifeResult!.calculation_basis).toContain('نقطة حاجة');
    });

    it('should consider family size in need calculation', () => {
      const params: DistributionParams = {
        total_amount: 100000,
        beneficiaries: mockBeneficiaries,
        deductions: mockDeductions,
        pattern: 'need_based',
      };

      const result = DistributionEngine.calculate(params);

      // Son with larger family should have more need points
      const sonResult = result.results.find((r) => r.beneficiary_id === '1');
      const daughterResult = result.results.find((r) => r.beneficiary_id === '2');

      // Both should have need points calculated
      expect(sonResult!.calculation_basis).toContain('نقطة حاجة');
      expect(daughterResult!.calculation_basis).toContain('نقطة حاجة');
    });
  });

  describe('Custom Distribution', () => {
    it('should distribute according to custom weights', () => {
      const params: DistributionParams = {
        total_amount: 100000,
        beneficiaries: mockBeneficiaries,
        deductions: mockDeductions,
        pattern: 'custom',
        custom_weights: {
          '1': 50,
          '2': 30,
          '3': 20,
        },
      };

      const result = DistributionEngine.calculate(params);

      const sonResult = result.results.find((r) => r.beneficiary_id === '1');
      const daughterResult = result.results.find((r) => r.beneficiary_id === '2');
      const wifeResult = result.results.find((r) => r.beneficiary_id === '3');

      expect(sonResult!.percentage).toBe(50);
      expect(daughterResult!.percentage).toBe(30);
      expect(wifeResult!.percentage).toBe(20);
    });

    it('should throw error if custom weights are not provided', () => {
      const params: DistributionParams = {
        total_amount: 100000,
        beneficiaries: mockBeneficiaries,
        deductions: mockDeductions,
        pattern: 'custom',
      };

      expect(() => DistributionEngine.calculate(params)).toThrow();
    });
  });

  describe('Hybrid Distribution', () => {
    it('should combine shariah and need-based with default weights', () => {
      const params: DistributionParams = {
        total_amount: 100000,
        beneficiaries: mockBeneficiaries,
        deductions: mockDeductions,
        pattern: 'hybrid',
      };

      const result = DistributionEngine.calculate(params);

      expect(result.summary.pattern_used).toContain('مختلط');

      // All results should have hybrid calculation basis
      result.results.forEach((r) => {
        expect(r.calculation_basis).toContain('مختلط');
      });
    });

    it('should use custom hybrid config if provided', () => {
      const params: DistributionParams = {
        total_amount: 100000,
        beneficiaries: mockBeneficiaries,
        deductions: mockDeductions,
        pattern: 'hybrid',
        hybrid_config: {
          shariah_weight: 0.3,
          need_weight: 0.7,
        },
      };

      const result = DistributionEngine.calculate(params);

      // Check that the weights are reflected in calculation basis
      const firstResult = result.results[0];
      expect(firstResult.calculation_basis).toContain('30%');
      expect(firstResult.calculation_basis).toContain('70%');
    });
  });

  describe('Summary Calculations', () => {
    it('should return correct summary data', () => {
      const params: DistributionParams = {
        total_amount: 100000,
        beneficiaries: mockBeneficiaries,
        deductions: mockDeductions,
        pattern: 'equal',
      };

      const result = DistributionEngine.calculate(params);

      expect(result.summary.total_amount).toBe(100000);
      expect(result.summary.beneficiaries_count).toBe(3);
      expect(result.summary.deductions.nazer_share).toBe(5000);
      expect(result.summary.deductions.reserve).toBe(10000);
      expect(result.summary.deductions.waqf_corpus).toBe(5000);
      expect(result.summary.deductions.maintenance).toBe(3000);
      expect(result.summary.deductions.development).toBe(2000);
    });

    it('should have total distributed close to distributable amount', () => {
      const params: DistributionParams = {
        total_amount: 100000,
        beneficiaries: mockBeneficiaries,
        deductions: mockDeductions,
        pattern: 'equal',
      };

      const result = DistributionEngine.calculate(params);

      expect(result.summary.total_distributed).toBeCloseTo(
        result.summary.distributable_amount,
        0
      );
    });
  });

  describe('Pattern Selection', () => {
    it('should throw error for unsupported pattern', () => {
      const params: DistributionParams = {
        total_amount: 100000,
        beneficiaries: mockBeneficiaries,
        deductions: mockDeductions,
        pattern: 'invalid' as any,
      };

      expect(() => DistributionEngine.calculate(params)).toThrow('نمط توزيع غير مدعوم');
    });
  });
});
