/**
 * اختبارات خدمة التقارير
 * Report Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportService } from '@/services/report.service';
import { mockSupabase, setMockTableData, clearMockTableData } from '../../utils/supabase.mock';

describe('ReportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('getAnnualDisclosures', () => {
    it('should fetch annual disclosures', async () => {
      setMockTableData('annual_disclosures', []);

      const result = await ReportService.getAnnualDisclosures();
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getCurrentYearDisclosure', () => {
    it('should fetch current year disclosure', async () => {
      setMockTableData('annual_disclosures', []);

      const result = await ReportService.getCurrentYearDisclosure();
      
      expect(result).toBeDefined();
    });
  });

  describe('generateAnnualDisclosure', () => {
    it('should generate annual disclosure', async () => {
      setMockTableData('annual_disclosures', []);

      const result = await ReportService.generateAnnualDisclosure(2024, 'وقف اختباري');
      
      expect(result).toBeDefined();
    });
  });

  describe('publishDisclosure', () => {
    it('should publish disclosure', async () => {
      setMockTableData('annual_disclosures', [{ id: 'disc-1' }]);

      const result = await ReportService.publishDisclosure('disc-1');
      
      expect(result).toBeDefined();
    });
  });
});
