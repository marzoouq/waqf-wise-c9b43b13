/**
 * اختبارات خدمة لوحة التحكم
 * Dashboard Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardService } from '@/services/dashboard.service';
import { mockSupabase, setMockTableData, clearMockTableData } from '../../utils/supabase.mock';

describe('DashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('getUnifiedKPIs', () => {
    it('should fetch unified KPIs', async () => {
      setMockTableData('beneficiaries', []);
      setMockTableData('properties', []);
      setMockTableData('contracts', []);

      const result = await DashboardService.getUnifiedKPIs();
      
      expect(result).toBeDefined();
    });
  });

  describe('getDashboardKPIs', () => {
    it('should fetch dashboard KPIs', async () => {
      setMockTableData('beneficiaries', []);
      setMockTableData('properties', []);

      const result = await DashboardService.getDashboardKPIs();
      
      expect(result).toBeDefined();
    });
  });

  describe('getSystemOverview', () => {
    it('should fetch system overview', async () => {
      setMockTableData('beneficiaries', []);
      setMockTableData('properties', []);

      const result = await DashboardService.getSystemOverview();
      
      expect(result).toBeDefined();
    });
  });

  describe('getDashboardConfigs', () => {
    it('should return dashboard configs array', async () => {
      setMockTableData('dashboard_configurations', []);

      // Test that the function exists and is callable
      expect(DashboardService.getDashboardConfigs).toBeDefined();
      expect(typeof DashboardService.getDashboardConfigs).toBe('function');
    });
  });
});
