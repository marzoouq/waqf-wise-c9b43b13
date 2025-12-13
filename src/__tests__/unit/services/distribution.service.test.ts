/**
 * اختبارات خدمة التوزيعات
 * Distribution Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DistributionService } from '@/services/distribution.service';
import { supabase } from '@/integrations/supabase/client';
import { setMockTableData, clearMockTableData } from '../../utils/supabase.mock';
import { mockDistributions } from '../../utils/data.fixtures';

describe('DistributionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('getAll', () => {
    it('should fetch all distributions', async () => {
      setMockTableData('distributions', mockDistributions);

      const result = await DistributionService.getAll();
      
      expect(supabase.from).toHaveBeenCalledWith('distributions');
      expect(result).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should fetch distribution by ID', async () => {
      const testDistribution = mockDistributions[0];
      setMockTableData('distributions', [testDistribution]);

      const result = await DistributionService.getById(testDistribution.id);
      
      expect(result).toBeDefined();
    });
  });

  describe('getHeirDistributions', () => {
    it('should fetch heir distributions', async () => {
      setMockTableData('heir_distributions', [
        { id: 'hd-1', beneficiary_id: 'ben-1', amount: 10000 },
      ]);

      const result = await DistributionService.getHeirDistributions('ben-1');
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('create', () => {
    it('should create new distribution', async () => {
      const newDistribution = {
        fiscal_year_id: 'fy-2024',
        total_amount: 100000,
        status: 'مسودة',
        beneficiaries_count: 10,
        distribution_date: '2024-01-15',
        month: 'يناير',
      };

      setMockTableData('distributions', [{ id: 'new-dist', ...newDistribution }]);

      const result = await DistributionService.create(newDistribution);
      
      expect(result).toBeDefined();
    });
  });

  describe('getSummary', () => {
    it('should get distribution summary', async () => {
      setMockTableData('distributions', mockDistributions);

      const result = await DistributionService.getSummary();
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalDistributions');
      expect(result).toHaveProperty('totalAmount');
    });
  });

  describe('simulate', () => {
    it('should simulate distribution', () => {
      const result = DistributionService.simulate({
        totalAmount: 10000,
        beneficiaryIds: ['ben-1', 'ben-2'],
        distributionMethod: 'equal',
      });
      
      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(5000);
    });
  });
});
