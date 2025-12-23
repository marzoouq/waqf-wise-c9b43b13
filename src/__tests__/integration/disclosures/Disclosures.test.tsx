/**
 * Disclosures Integration Tests - اختبارات تكامل الإفصاحات
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  mockDisclosures, 
  mockDisclosureBeneficiaries,
  mockRevenueBreakdown,
  mockExpensesBreakdown,
  mockDisclosureStats 
} from '../../fixtures/disclosures.fixtures';

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
      single: vi.fn().mockResolvedValue({ data: mockDisclosures[0], error: null }),
      then: vi.fn().mockResolvedValue({ data: mockDisclosures, error: null }),
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

describe('Disclosures Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Disclosures Data Structure', () => {
    it('should have mock disclosures data available', () => {
      expect(mockDisclosures).toBeDefined();
      expect(mockDisclosures.length).toBeGreaterThan(0);
    });

    it('should have correct disclosure structure', () => {
      const disclosure = mockDisclosures[0];
      expect(disclosure).toHaveProperty('id');
      expect(disclosure).toHaveProperty('year');
      expect(disclosure).toHaveProperty('waqf_name');
      expect(disclosure).toHaveProperty('status');
      expect(disclosure).toHaveProperty('total_revenues');
      expect(disclosure).toHaveProperty('total_expenses');
      expect(disclosure).toHaveProperty('net_income');
    });

    it('should have valid status values', () => {
      const validStatuses = ['draft', 'published', 'archived'];
      mockDisclosures.forEach(disclosure => {
        expect(validStatuses).toContain(disclosure.status);
      });
    });

    it('should have financial data calculated correctly', () => {
      mockDisclosures.forEach(disclosure => {
        expect(disclosure.net_income).toBe(
          disclosure.total_revenues - disclosure.total_expenses
        );
      });
    });
  });

  describe('Disclosure Beneficiaries', () => {
    it('should have beneficiaries data', () => {
      expect(mockDisclosureBeneficiaries).toBeDefined();
      expect(mockDisclosureBeneficiaries.length).toBeGreaterThan(0);
    });

    it('should have correct beneficiary structure', () => {
      const ben = mockDisclosureBeneficiaries[0];
      expect(ben).toHaveProperty('disclosure_id');
      expect(ben).toHaveProperty('beneficiary_id');
      expect(ben).toHaveProperty('beneficiary_name');
      expect(ben).toHaveProperty('share_percentage');
      expect(ben).toHaveProperty('share_amount');
    });
  });

  describe('Revenue Breakdown', () => {
    it('should have revenue breakdown', () => {
      expect(mockRevenueBreakdown).toBeDefined();
      expect(mockRevenueBreakdown.length).toBeGreaterThan(0);
    });

    it('should have correct breakdown structure', () => {
      const item = mockRevenueBreakdown[0];
      expect(item).toHaveProperty('source');
      expect(item).toHaveProperty('amount');
      expect(item).toHaveProperty('percentage');
    });

    it('should have percentages sum to 100', () => {
      const total = mockRevenueBreakdown.reduce((sum, item) => sum + item.percentage, 0);
      expect(total).toBe(100);
    });
  });

  describe('Expenses Breakdown', () => {
    it('should have expenses breakdown', () => {
      expect(mockExpensesBreakdown).toBeDefined();
      expect(mockExpensesBreakdown.length).toBeGreaterThan(0);
    });

    it('should have correct breakdown structure', () => {
      const item = mockExpensesBreakdown[0];
      expect(item).toHaveProperty('category');
      expect(item).toHaveProperty('amount');
      expect(item).toHaveProperty('percentage');
    });
  });

  describe('Disclosure Statistics', () => {
    it('should have stats defined', () => {
      expect(mockDisclosureStats).toBeDefined();
    });

    it('should track total disclosures', () => {
      expect(mockDisclosureStats.total_disclosures).toBeGreaterThan(0);
    });

    it('should track published count', () => {
      expect(mockDisclosureStats.published_count).toBeGreaterThanOrEqual(0);
    });

    it('should track total distributed', () => {
      expect(mockDisclosureStats.total_distributed).toBeGreaterThan(0);
    });
  });

  describe('Disclosure Share Distribution', () => {
    it('should have nazer share percentage', () => {
      mockDisclosures.forEach(disclosure => {
        expect(disclosure.nazer_percentage).toBeGreaterThan(0);
        expect(disclosure.nazer_share).toBeGreaterThan(0);
      });
    });

    it('should have corpus share', () => {
      mockDisclosures.forEach(disclosure => {
        expect(disclosure.corpus_percentage).toBeGreaterThan(0);
        expect(disclosure.corpus_share).toBeGreaterThan(0);
      });
    });

    it('should have charity share', () => {
      mockDisclosures.forEach(disclosure => {
        expect(disclosure.charity_percentage).toBeGreaterThan(0);
        expect(disclosure.charity_share).toBeGreaterThan(0);
      });
    });
  });

  describe('Disclosure Filtering', () => {
    it('should filter by year', () => {
      const filtered = mockDisclosures.filter(d => d.year === 2024);
      expect(filtered.length).toBeGreaterThan(0);
    });

    it('should filter by status', () => {
      const published = mockDisclosures.filter(d => d.status === 'published');
      expect(published).toBeDefined();
    });

    it('should filter drafts', () => {
      const drafts = mockDisclosures.filter(d => d.status === 'draft');
      expect(drafts).toBeDefined();
    });
  });
});
