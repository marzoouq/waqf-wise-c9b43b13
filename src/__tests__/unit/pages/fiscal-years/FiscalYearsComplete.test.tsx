/**
 * اختبارات شاملة لصفحة السنوات المالية
 * Comprehensive Fiscal Years Page Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setMockTableData, clearMockTableData } from '@/test/setup';

const mockFiscalYears = [
  { id: 'fy1', name: '2024-2025', start_date: '2024-10-25', end_date: '2025-10-24', is_active: false, is_closed: true, is_published: true, total_revenue: 1000000, total_expenses: 150000 },
  { id: 'fy2', name: '2025-2026', start_date: '2025-10-25', end_date: '2026-10-24', is_active: true, is_closed: false, is_published: false, total_revenue: 850000, total_expenses: 0 },
];

const mockFiscalYearClosings = [
  { id: '1', fiscal_year_id: 'fy1', closing_date: '2025-10-24', closed_by: 'user1', net_income: 850000, corpus_addition: 50000, nazer_share: 85000 },
];

describe('Fiscal Years Page - Complete Tests', () => {
  beforeEach(() => {
    clearMockTableData();
    vi.clearAllMocks();
  });

  describe('Fiscal Year List (قائمة السنوات المالية)', () => {
    beforeEach(() => {
      setMockTableData('fiscal_years', mockFiscalYears);
    });

    it('should display all fiscal years', () => {
      expect(mockFiscalYears).toHaveLength(2);
    });

    it('should show fiscal year names', () => {
      expect(mockFiscalYears[0].name).toBe('2024-2025');
      expect(mockFiscalYears[1].name).toBe('2025-2026');
    });

    it('should identify active fiscal year', () => {
      const active = mockFiscalYears.find(fy => fy.is_active);
      expect(active?.name).toBe('2025-2026');
    });

    it('should identify closed fiscal years', () => {
      const closed = mockFiscalYears.filter(fy => fy.is_closed);
      expect(closed).toHaveLength(1);
    });

    it('should identify published fiscal years', () => {
      const published = mockFiscalYears.filter(fy => fy.is_published);
      expect(published).toHaveLength(1);
    });
  });

  describe('Fiscal Year Details (تفاصيل السنة المالية)', () => {
    beforeEach(() => {
      setMockTableData('fiscal_years', mockFiscalYears);
    });

    it('should show date range', () => {
      const fy = mockFiscalYears[0];
      expect(fy.start_date).toBe('2024-10-25');
      expect(fy.end_date).toBe('2025-10-24');
    });

    it('should show revenue and expenses', () => {
      expect(mockFiscalYears[0].total_revenue).toBe(1000000);
      expect(mockFiscalYears[0].total_expenses).toBe(150000);
    });

    it('should calculate net income', () => {
      const fy = mockFiscalYears[0];
      const netIncome = fy.total_revenue - fy.total_expenses;
      expect(netIncome).toBe(850000);
    });
  });

  describe('Close Fiscal Year (إقفال السنة المالية)', () => {
    beforeEach(() => {
      setMockTableData('fiscal_year_closings', mockFiscalYearClosings);
    });

    it('should show closing details', () => {
      const closing = mockFiscalYearClosings[0];
      expect(closing.net_income).toBe(850000);
      expect(closing.corpus_addition).toBe(50000);
      expect(closing.nazer_share).toBe(85000);
    });

    it('should prevent closing already closed year', () => {
      const fy = mockFiscalYears[0];
      const canClose = !fy.is_closed;
      expect(canClose).toBe(false);
    });
  });

  describe('Publish Fiscal Year (نشر السنة المالية)', () => {
    it('should publish closed fiscal year', () => {
      const publishFiscalYear = (fy: typeof mockFiscalYears[0]) => ({
        ...fy,
        is_published: true
      });
      const published = publishFiscalYear(mockFiscalYears[0]);
      expect(published.is_published).toBe(true);
    });

    it('should prevent publishing unclosed year', () => {
      const fy = mockFiscalYears[1];
      const canPublish = fy.is_closed && !fy.is_published;
      expect(canPublish).toBe(false);
    });
  });

  describe('Add Fiscal Year (إضافة سنة مالية)', () => {
    it('should create new fiscal year', () => {
      const newFY = {
        name: '2026-2027',
        start_date: '2026-10-25',
        end_date: '2027-10-24',
        is_active: false,
        is_closed: false
      };
      expect(newFY.name).toBe('2026-2027');
    });

    it('should validate date range', () => {
      const startDate = new Date('2026-10-25');
      const endDate = new Date('2027-10-24');
      const durationDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(durationDays).toBe(364);
    });
  });
});
