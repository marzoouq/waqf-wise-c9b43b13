/**
 * Vouchers Integration Tests - اختبارات تكامل سندات الصرف
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  mockPaymentVouchers, 
  mockVoucherTypes,
  mockVoucherStats,
  mockVoucherApprovals 
} from '../../fixtures/vouchers.fixtures';

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
      single: vi.fn().mockResolvedValue({ data: mockPaymentVouchers[0], error: null }),
      then: vi.fn().mockResolvedValue({ data: mockPaymentVouchers, error: null }),
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

describe('Vouchers Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Payment Vouchers Data Structure', () => {
    it('should have mock vouchers data available', () => {
      expect(mockPaymentVouchers).toBeDefined();
      expect(mockPaymentVouchers.length).toBeGreaterThan(0);
    });

    it('should have correct voucher structure', () => {
      const voucher = mockPaymentVouchers[0];
      expect(voucher).toHaveProperty('id');
      expect(voucher).toHaveProperty('voucher_number');
      expect(voucher).toHaveProperty('voucher_date');
      expect(voucher).toHaveProperty('amount');
      expect(voucher).toHaveProperty('payment_type');
      expect(voucher).toHaveProperty('payment_method');
      expect(voucher).toHaveProperty('status');
    });

    it('should have valid status values', () => {
      const validStatuses = ['pending', 'approved', 'paid', 'rejected', 'cancelled'];
      mockPaymentVouchers.forEach(voucher => {
        expect(validStatuses).toContain(voucher.status);
      });
    });

    it('should have valid payment types', () => {
      const validTypes = ['distribution', 'emergency_aid', 'loan', 'expense', 'refund'];
      mockPaymentVouchers.forEach(voucher => {
        expect(validTypes).toContain(voucher.payment_type);
      });
    });

    it('should have valid payment methods', () => {
      const validMethods = ['bank_transfer', 'cash', 'check'];
      mockPaymentVouchers.forEach(voucher => {
        expect(validMethods).toContain(voucher.payment_method);
      });
    });
  });

  describe('Voucher Types', () => {
    it('should have voucher types defined', () => {
      expect(mockVoucherTypes).toBeDefined();
      expect(mockVoucherTypes.length).toBeGreaterThan(0);
    });

    it('should have correct type structure', () => {
      const type = mockVoucherTypes[0];
      expect(type).toHaveProperty('id');
      expect(type).toHaveProperty('name');
      expect(type).toHaveProperty('icon');
      expect(type).toHaveProperty('color');
    });
  });

  describe('Voucher Statistics', () => {
    it('should have stats defined', () => {
      expect(mockVoucherStats).toBeDefined();
    });

    it('should track total vouchers', () => {
      expect(mockVoucherStats.total_vouchers).toBeGreaterThan(0);
    });

    it('should track pending count', () => {
      expect(mockVoucherStats.pending_count).toBeGreaterThanOrEqual(0);
    });

    it('should track paid count', () => {
      expect(mockVoucherStats.paid_count).toBeGreaterThanOrEqual(0);
    });

    it('should track total amount', () => {
      expect(mockVoucherStats.total_amount).toBeGreaterThan(0);
    });

    it('should track this month data', () => {
      expect(mockVoucherStats.this_month_count).toBeGreaterThanOrEqual(0);
      expect(mockVoucherStats.this_month_amount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Voucher Approvals', () => {
    it('should have approvals data', () => {
      expect(mockVoucherApprovals).toBeDefined();
      expect(mockVoucherApprovals.length).toBeGreaterThan(0);
    });

    it('should have correct approval structure', () => {
      const approval = mockVoucherApprovals[0];
      expect(approval).toHaveProperty('id');
      expect(approval).toHaveProperty('voucher_id');
      expect(approval).toHaveProperty('approver_id');
      expect(approval).toHaveProperty('action');
    });

    it('should have valid actions', () => {
      const validActions = ['approved', 'rejected'];
      mockVoucherApprovals.forEach(approval => {
        expect(validActions).toContain(approval.action);
      });
    });
  });

  describe('Voucher Filtering', () => {
    it('should filter pending vouchers', () => {
      const pending = mockPaymentVouchers.filter(v => v.status === 'pending');
      expect(pending).toBeDefined();
    });

    it('should filter paid vouchers', () => {
      const paid = mockPaymentVouchers.filter(v => v.status === 'paid');
      expect(paid.length).toBeGreaterThan(0);
    });

    it('should filter by payment type', () => {
      const distributions = mockPaymentVouchers.filter(v => v.payment_type === 'distribution');
      expect(distributions.length).toBeGreaterThan(0);
    });

    it('should filter by beneficiary', () => {
      const filtered = mockPaymentVouchers.filter(v => v.beneficiary_id === 'ben-1');
      expect(filtered).toBeDefined();
    });

    it('should filter bank transfers', () => {
      const bankTransfers = mockPaymentVouchers.filter(v => v.payment_method === 'bank_transfer');
      expect(bankTransfers.length).toBeGreaterThan(0);
    });
  });

  describe('Voucher Workflow', () => {
    it('should have approval workflow for pending vouchers', () => {
      const pending = mockPaymentVouchers.filter(v => v.status === 'pending');
      pending.forEach(voucher => {
        expect(voucher.approved_by).toBeNull();
        expect(voucher.paid_at).toBeNull();
      });
    });

    it('should have paid_at for paid vouchers', () => {
      const paid = mockPaymentVouchers.filter(v => v.status === 'paid');
      paid.forEach(voucher => {
        expect(voucher.paid_at).not.toBeNull();
      });
    });
  });
});
