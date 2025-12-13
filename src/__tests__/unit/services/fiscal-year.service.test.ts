/**
 * اختبارات خدمة السنوات المالية
 * Fiscal Year Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FiscalYearService } from '@/services/fiscal-year.service';
import { mockSupabase, setMockTableData, clearMockTableData } from '../../utils/supabase.mock';

describe('FiscalYearService', () => {
  const mockFiscalYears = [
    {
      id: 'fy-2024',
      name: '2024-2025',
      start_date: '2024-10-25',
      end_date: '2025-10-24',
      is_active: true,
      is_closed: false,
    },
    {
      id: 'fy-2023',
      name: '2023-2024',
      start_date: '2023-10-25',
      end_date: '2024-10-24',
      is_active: false,
      is_closed: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('getAll', () => {
    it('should fetch all fiscal years', async () => {
      setMockTableData('fiscal_years', mockFiscalYears);

      const result = await FiscalYearService.getAll();
      
      expect(mockSupabase.from).toHaveBeenCalledWith('fiscal_years');
      expect(result).toBeDefined();
    });
  });

  describe('getActive', () => {
    it('should fetch active fiscal year', async () => {
      const activeFY = mockFiscalYears.find(fy => fy.is_active);
      setMockTableData('fiscal_years', [activeFY]);

      const result = await FiscalYearService.getActive();
      
      expect(result).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should fetch fiscal year by ID', async () => {
      setMockTableData('fiscal_years', [mockFiscalYears[0]]);

      const result = await FiscalYearService.getById(mockFiscalYears[0].id);
      
      expect(result).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create new fiscal year', async () => {
      const newFiscalYear = {
        name: '2025-2026',
        start_date: '2025-10-25',
        end_date: '2026-10-24',
        is_active: false,
        is_closed: false,
      };

      setMockTableData('fiscal_years', [{ id: 'new-id', ...newFiscalYear }]);

      const result = await FiscalYearService.create(newFiscalYear);
      
      expect(result).toBeDefined();
    });
  });

  describe('close', () => {
    it('should close fiscal year', async () => {
      setMockTableData('fiscal_years', mockFiscalYears);

      const result = await FiscalYearService.close(mockFiscalYears[0].id);
      
      expect(result).toBeDefined();
    });
  });

  describe('publish', () => {
    it('should publish fiscal year', async () => {
      setMockTableData('fiscal_years', mockFiscalYears);

      const result = await FiscalYearService.publish(mockFiscalYears[0].id);
      
      expect(result).toBeDefined();
    });
  });
});
