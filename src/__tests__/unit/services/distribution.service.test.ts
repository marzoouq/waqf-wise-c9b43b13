/**
 * اختبارات خدمة التوزيعات
 * Distribution Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DistributionService } from '@/services/distribution.service';
import { mockSupabase, setMockTableData, clearMockTableData } from '../../utils/supabase.mock';
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
      
      expect(mockSupabase.from).toHaveBeenCalledWith('distributions');
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
      };

      setMockTableData('distributions', [{ id: 'new-dist', ...newDistribution }]);

      const result = await DistributionService.create(newDistribution);
      
      expect(result).toBeDefined();
    });
  });
});
