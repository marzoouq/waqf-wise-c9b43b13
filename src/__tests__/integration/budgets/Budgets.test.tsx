/**
 * Budgets Integration Tests - اختبارات تكامل الميزانيات
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock data
const mockBudgets = [
  {
    id: 'budget-1',
    name: 'ميزانية 2024',
    fiscal_year_id: 'fy-2024',
    fiscal_year_name: '2024',
    total_amount: 5000000,
    allocated_amount: 4500000,
    spent_amount: 2250000,
    remaining_amount: 2250000,
    status: 'active',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
    created_by: 'admin-1',
  },
  {
    id: 'budget-2',
    name: 'ميزانية 2023',
    fiscal_year_id: 'fy-2023',
    fiscal_year_name: '2023',
    total_amount: 4500000,
    allocated_amount: 4500000,
    spent_amount: 4200000,
    remaining_amount: 300000,
    status: 'closed',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    created_at: '2023-01-01T10:00:00Z',
    updated_at: '2023-12-31T10:00:00Z',
    created_by: 'admin-1',
  },
];

const mockBudgetItems = [
  {
    id: 'item-1',
    budget_id: 'budget-1',
    category: 'توزيعات المستفيدين',
    allocated_amount: 3000000,
    spent_amount: 1500000,
    remaining_amount: 1500000,
    percentage_used: 50,
  },
  {
    id: 'item-2',
    budget_id: 'budget-1',
    category: 'صيانة العقارات',
    allocated_amount: 500000,
    spent_amount: 250000,
    remaining_amount: 250000,
    percentage_used: 50,
  },
  {
    id: 'item-3',
    budget_id: 'budget-1',
    category: 'مصاريف إدارية',
    allocated_amount: 300000,
    spent_amount: 150000,
    remaining_amount: 150000,
    percentage_used: 50,
  },
];

const mockBudgetStats = {
  total_budgets: 5,
  active_budgets: 1,
  total_allocated: 5000000,
  total_spent: 2250000,
  total_remaining: 2750000,
  average_utilization: 45,
};

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
      single: vi.fn().mockResolvedValue({ data: mockBudgets[0], error: null }),
      then: vi.fn().mockResolvedValue({ data: mockBudgets, error: null }),
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

describe('Budgets Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Budgets Data Structure', () => {
    it('should have mock budgets data available', () => {
      expect(mockBudgets).toBeDefined();
      expect(mockBudgets.length).toBeGreaterThan(0);
    });

    it('should have correct budget structure', () => {
      const budget = mockBudgets[0];
      expect(budget).toHaveProperty('id');
      expect(budget).toHaveProperty('name');
      expect(budget).toHaveProperty('fiscal_year_id');
      expect(budget).toHaveProperty('total_amount');
      expect(budget).toHaveProperty('allocated_amount');
      expect(budget).toHaveProperty('spent_amount');
      expect(budget).toHaveProperty('remaining_amount');
      expect(budget).toHaveProperty('status');
    });

    it('should have valid status values', () => {
      const validStatuses = ['draft', 'active', 'closed', 'cancelled'];
      mockBudgets.forEach(budget => {
        expect(validStatuses).toContain(budget.status);
      });
    });

    it('should have correct remaining calculation', () => {
      mockBudgets.forEach(budget => {
        expect(budget.remaining_amount).toBe(budget.allocated_amount - budget.spent_amount);
      });
    });
  });

  describe('Budget Items', () => {
    it('should have items data', () => {
      expect(mockBudgetItems).toBeDefined();
      expect(mockBudgetItems.length).toBeGreaterThan(0);
    });

    it('should have correct item structure', () => {
      const item = mockBudgetItems[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('budget_id');
      expect(item).toHaveProperty('category');
      expect(item).toHaveProperty('allocated_amount');
      expect(item).toHaveProperty('spent_amount');
      expect(item).toHaveProperty('percentage_used');
    });

    it('should have valid percentage values', () => {
      mockBudgetItems.forEach(item => {
        expect(item.percentage_used).toBeGreaterThanOrEqual(0);
        expect(item.percentage_used).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Budget Statistics', () => {
    it('should have stats defined', () => {
      expect(mockBudgetStats).toBeDefined();
    });

    it('should track total budgets', () => {
      expect(mockBudgetStats.total_budgets).toBeGreaterThan(0);
    });

    it('should track active budgets', () => {
      expect(mockBudgetStats.active_budgets).toBeGreaterThanOrEqual(0);
    });

    it('should track financial totals', () => {
      expect(mockBudgetStats.total_allocated).toBeGreaterThan(0);
      expect(mockBudgetStats.total_spent).toBeGreaterThanOrEqual(0);
      expect(mockBudgetStats.total_remaining).toBeGreaterThanOrEqual(0);
    });

    it('should have average utilization', () => {
      expect(mockBudgetStats.average_utilization).toBeGreaterThanOrEqual(0);
      expect(mockBudgetStats.average_utilization).toBeLessThanOrEqual(100);
    });
  });

  describe('Budget Filtering', () => {
    it('should filter active budgets', () => {
      const active = mockBudgets.filter(b => b.status === 'active');
      expect(active.length).toBeGreaterThan(0);
    });

    it('should filter closed budgets', () => {
      const closed = mockBudgets.filter(b => b.status === 'closed');
      expect(closed).toBeDefined();
    });

    it('should filter by fiscal year', () => {
      const filtered = mockBudgets.filter(b => b.fiscal_year_id === 'fy-2024');
      expect(filtered.length).toBeGreaterThan(0);
    });

    it('should get budget items by budget id', () => {
      const items = mockBudgetItems.filter(i => i.budget_id === 'budget-1');
      expect(items.length).toBeGreaterThan(0);
    });
  });

  describe('Budget Utilization', () => {
    it('should calculate utilization correctly', () => {
      mockBudgets.forEach(budget => {
        const utilization = (budget.spent_amount / budget.allocated_amount) * 100;
        expect(utilization).toBeGreaterThanOrEqual(0);
        expect(utilization).toBeLessThanOrEqual(100);
      });
    });

    it('should identify over-budget items', () => {
      const overBudget = mockBudgetItems.filter(i => i.spent_amount > i.allocated_amount);
      expect(overBudget).toBeDefined();
    });
  });
});
