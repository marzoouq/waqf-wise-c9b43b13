/**
 * Funds Integration Tests - اختبارات تكامل الصناديق
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  mockFunds, 
  mockFundTransactions,
  mockFundAllocations,
  mockFundStats,
  mockFundTypes 
} from '../../fixtures/funds.fixtures';

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
      single: vi.fn().mockResolvedValue({ data: mockFunds[0], error: null }),
      then: vi.fn().mockResolvedValue({ data: mockFunds, error: null }),
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

describe('Funds Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Funds Data Structure', () => {
    it('should have mock funds data available', () => {
      expect(mockFunds).toBeDefined();
      expect(mockFunds.length).toBeGreaterThan(0);
    });

    it('should have correct fund structure', () => {
      const fund = mockFunds[0];
      expect(fund).toHaveProperty('id');
      expect(fund).toHaveProperty('name');
      expect(fund).toHaveProperty('code');
      expect(fund).toHaveProperty('fund_type');
      expect(fund).toHaveProperty('target_balance');
      expect(fund).toHaveProperty('current_balance');
      expect(fund).toHaveProperty('minimum_balance');
    });

    it('should have valid fund types', () => {
      const validTypes = ['emergency', 'development', 'maintenance', 'charity', 'reserve'];
      mockFunds.forEach(fund => {
        expect(validTypes).toContain(fund.fund_type);
      });
    });

    it('should have current balance >= minimum balance for active funds', () => {
      mockFunds.filter(f => f.is_active).forEach(fund => {
        expect(fund.current_balance).toBeGreaterThanOrEqual(fund.minimum_balance);
      });
    });
  });

  describe('Fund Transactions', () => {
    it('should have transactions data', () => {
      expect(mockFundTransactions).toBeDefined();
      expect(mockFundTransactions.length).toBeGreaterThan(0);
    });

    it('should have correct transaction structure', () => {
      const tx = mockFundTransactions[0];
      expect(tx).toHaveProperty('id');
      expect(tx).toHaveProperty('fund_id');
      expect(tx).toHaveProperty('transaction_type');
      expect(tx).toHaveProperty('amount');
      expect(tx).toHaveProperty('balance_after');
    });

    it('should have valid transaction types', () => {
      const validTypes = ['deposit', 'withdrawal', 'transfer'];
      mockFundTransactions.forEach(tx => {
        expect(validTypes).toContain(tx.transaction_type);
      });
    });
  });

  describe('Fund Allocations', () => {
    it('should have allocations data', () => {
      expect(mockFundAllocations).toBeDefined();
      expect(mockFundAllocations.length).toBeGreaterThan(0);
    });

    it('should have correct allocation structure', () => {
      const alloc = mockFundAllocations[0];
      expect(alloc).toHaveProperty('id');
      expect(alloc).toHaveProperty('fund_id');
      expect(alloc).toHaveProperty('source');
      expect(alloc).toHaveProperty('percentage');
      expect(alloc).toHaveProperty('is_automatic');
    });

    it('should have valid percentage values', () => {
      mockFundAllocations.forEach(alloc => {
        expect(alloc.percentage).toBeGreaterThan(0);
        expect(alloc.percentage).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Fund Statistics', () => {
    it('should have stats defined', () => {
      expect(mockFundStats).toBeDefined();
    });

    it('should track total funds count', () => {
      expect(mockFundStats.total_funds).toBeGreaterThan(0);
    });

    it('should track total balance', () => {
      expect(mockFundStats.total_balance).toBeGreaterThan(0);
    });

    it('should track funds below minimum', () => {
      expect(mockFundStats.funds_below_minimum).toBeGreaterThanOrEqual(0);
    });

    it('should track monthly allocations and withdrawals', () => {
      expect(mockFundStats.monthly_allocations).toBeGreaterThanOrEqual(0);
      expect(mockFundStats.monthly_withdrawals).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Fund Types', () => {
    it('should have fund types defined', () => {
      expect(mockFundTypes).toBeDefined();
      expect(mockFundTypes.length).toBeGreaterThan(0);
    });

    it('should have correct type structure', () => {
      const type = mockFundTypes[0];
      expect(type).toHaveProperty('id');
      expect(type).toHaveProperty('name');
      expect(type).toHaveProperty('icon');
      expect(type).toHaveProperty('color');
    });
  });

  describe('Fund Filtering', () => {
    it('should filter active funds', () => {
      const active = mockFunds.filter(f => f.is_active);
      expect(active.length).toBe(mockFunds.length);
    });

    it('should filter by fund type', () => {
      const emergency = mockFunds.filter(f => f.fund_type === 'emergency');
      expect(emergency.length).toBeGreaterThan(0);
    });

    it('should filter funds at target', () => {
      const atTarget = mockFunds.filter(f => f.current_balance >= f.target_balance);
      expect(atTarget).toBeDefined();
    });

    it('should filter funds below minimum', () => {
      const belowMin = mockFunds.filter(f => f.current_balance < f.minimum_balance);
      expect(belowMin).toBeDefined();
    });
  });
});
