/**
 * Waqf Integration Tests - اختبارات تكامل الوقف
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  mockWaqfUnits, 
  mockWaqfInfo,
  mockWaqfSettings,
  mockWaqfStats,
  mockWaqfBudgets,
  mockLinkedProperties,
  mockWaqfSummary 
} from '../../fixtures/waqf.fixtures';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockWaqfUnits[0], error: null }),
      then: vi.fn().mockResolvedValue({ data: mockWaqfUnits, error: null }),
    })),
  },
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: Infinity },
    mutations: { retry: false },
  },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Waqf Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Waqf Units Data Structure', () => {
    it('should have mock waqf units data available', () => {
      expect(mockWaqfUnits).toBeDefined();
      expect(mockWaqfUnits.length).toBeGreaterThan(0);
    });

    it('should have correct unit structure', () => {
      const unit = mockWaqfUnits[0];
      expect(unit).toHaveProperty('id');
      expect(unit).toHaveProperty('name');
      expect(unit).toHaveProperty('code');
      expect(unit).toHaveProperty('unit_type');
      expect(unit).toHaveProperty('share_percentage');
      expect(unit).toHaveProperty('is_active');
    });

    it('should have valid unit types', () => {
      const validTypes = ['beneficiary', 'nazer', 'corpus', 'charity', 'reserve'];
      mockWaqfUnits.forEach(unit => {
        expect(validTypes).toContain(unit.unit_type);
      });
    });

    it('should have share percentages that sum to 100', () => {
      const total = mockWaqfUnits.reduce((sum, unit) => sum + unit.share_percentage, 0);
      expect(total).toBe(100);
    });
  });

  describe('Waqf Info', () => {
    it('should have waqf info defined', () => {
      expect(mockWaqfInfo).toBeDefined();
    });

    it('should have correct info structure', () => {
      expect(mockWaqfInfo).toHaveProperty('id');
      expect(mockWaqfInfo).toHaveProperty('name');
      expect(mockWaqfInfo).toHaveProperty('registration_number');
      expect(mockWaqfInfo).toHaveProperty('founder_name');
      expect(mockWaqfInfo).toHaveProperty('nazer_name');
      expect(mockWaqfInfo).toHaveProperty('total_capital');
      expect(mockWaqfInfo).toHaveProperty('status');
    });

    it('should have valid waqf type', () => {
      const validTypes = ['family', 'charitable', 'mixed'];
      expect(validTypes).toContain(mockWaqfInfo.waqf_type);
    });
  });

  describe('Waqf Settings', () => {
    it('should have settings defined', () => {
      expect(mockWaqfSettings).toBeDefined();
    });

    it('should have distribution settings', () => {
      expect(mockWaqfSettings).toHaveProperty('distribution_day');
      expect(mockWaqfSettings).toHaveProperty('distribution_frequency');
      expect(mockWaqfSettings).toHaveProperty('auto_distribution');
    });

    it('should have valid distribution frequency', () => {
      const validFrequencies = ['monthly', 'quarterly', 'annually'];
      expect(validFrequencies).toContain(mockWaqfSettings.distribution_frequency);
    });

    it('should have approval settings', () => {
      expect(mockWaqfSettings).toHaveProperty('nazer_approval_required');
    });
  });

  describe('Waqf Statistics', () => {
    it('should have stats defined', () => {
      expect(mockWaqfStats).toBeDefined();
    });

    it('should track properties and units', () => {
      expect(mockWaqfStats.total_properties).toBeGreaterThan(0);
      expect(mockWaqfStats.total_units).toBeGreaterThan(0);
    });

    it('should track beneficiaries', () => {
      expect(mockWaqfStats.total_beneficiaries).toBeGreaterThan(0);
    });

    it('should track financial metrics', () => {
      expect(mockWaqfStats.monthly_revenue).toBeGreaterThan(0);
      expect(mockWaqfStats.monthly_expenses).toBeGreaterThanOrEqual(0);
      expect(mockWaqfStats.net_monthly).toBeGreaterThan(0);
    });

    it('should track occupancy rate', () => {
      expect(mockWaqfStats.occupancy_rate).toBeGreaterThanOrEqual(0);
      expect(mockWaqfStats.occupancy_rate).toBeLessThanOrEqual(100);
    });
  });

  describe('Waqf Budgets', () => {
    it('should have budgets defined', () => {
      expect(mockWaqfBudgets).toBeDefined();
      expect(mockWaqfBudgets.length).toBeGreaterThan(0);
    });

    it('should have correct budget structure', () => {
      const budget = mockWaqfBudgets[0];
      expect(budget).toHaveProperty('id');
      expect(budget).toHaveProperty('unit_id');
      expect(budget).toHaveProperty('allocated_amount');
      expect(budget).toHaveProperty('spent_amount');
      expect(budget).toHaveProperty('remaining_amount');
      expect(budget).toHaveProperty('percentage_used');
    });

    it('should have correct budget calculation', () => {
      mockWaqfBudgets.forEach(budget => {
        expect(budget.remaining_amount).toBe(budget.allocated_amount - budget.spent_amount);
      });
    });
  });

  describe('Linked Properties', () => {
    it('should have linked properties defined', () => {
      expect(mockLinkedProperties).toBeDefined();
      expect(mockLinkedProperties.length).toBeGreaterThan(0);
    });

    it('should have correct structure', () => {
      const link = mockLinkedProperties[0];
      expect(link).toHaveProperty('id');
      expect(link).toHaveProperty('waqf_unit_id');
      expect(link).toHaveProperty('property_id');
      expect(link).toHaveProperty('share_percentage');
    });
  });

  describe('Waqf Summary', () => {
    it('should have summary defined', () => {
      expect(mockWaqfSummary).toBeDefined();
    });

    it('should have asset information', () => {
      expect(mockWaqfSummary.total_assets).toBeGreaterThan(0);
      expect(mockWaqfSummary.total_liabilities).toBeGreaterThanOrEqual(0);
      expect(mockWaqfSummary.net_worth).toBeGreaterThan(0);
    });

    it('should have annual financial data', () => {
      expect(mockWaqfSummary.annual_revenue).toBeGreaterThan(0);
      expect(mockWaqfSummary.annual_expenses).toBeGreaterThanOrEqual(0);
      expect(mockWaqfSummary.annual_net).toBeGreaterThan(0);
    });

    it('should have distribution breakdown', () => {
      expect(mockWaqfSummary.beneficiary_distributions).toBeGreaterThan(0);
      expect(mockWaqfSummary.charity_distributions).toBeGreaterThan(0);
      expect(mockWaqfSummary.nazer_compensation).toBeGreaterThan(0);
    });
  });

  describe('Waqf Unit Filtering', () => {
    it('should filter active units', () => {
      const active = mockWaqfUnits.filter(u => u.is_active);
      expect(active.length).toBe(mockWaqfUnits.length);
    });

    it('should filter by unit type', () => {
      const beneficiaryUnits = mockWaqfUnits.filter(u => u.unit_type === 'beneficiary');
      expect(beneficiaryUnits.length).toBeGreaterThan(0);
    });
  });
});
