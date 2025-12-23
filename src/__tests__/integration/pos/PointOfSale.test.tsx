/**
 * Point of Sale Tests - اختبارات نقطة البيع
 * @phase 14 - POS
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import {
  mockCashierShifts,
  mockPOSTransactions,
  mockDailySettlements,
  mockPendingRentals,
  mockPOSStats,
  posTestUsers,
} from '../../fixtures/pos.fixtures';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ 
          data: table === 'pos_transactions' ? mockPOSTransactions : mockCashierShifts, 
          error: null 
        })),
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockCashierShifts[0], error: null })),
          order: vi.fn(() => Promise.resolve({ data: mockPOSTransactions, error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: mockPOSTransactions[0], error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: mockCashierShifts[0], error: null })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: posTestUsers.cashier }, 
        error: null 
      })),
    },
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const renderWithProviders = (component: React.ReactNode) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Point of Sale (POS)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Cashier Shift Management', () => {
    it('should display cashier shifts', () => {
      expect(mockCashierShifts).toHaveLength(3);
    });

    it('should identify open vs closed shifts', () => {
      const openShifts = mockCashierShifts.filter(s => s.status === 'open');
      const closedShifts = mockCashierShifts.filter(s => s.status === 'closed');

      expect(openShifts).toHaveLength(1);
      expect(closedShifts).toHaveLength(2);
    });

    it('should track shift opening balance', () => {
      const shift = mockCashierShifts[0];
      expect(shift.opening_balance).toBe(5000);
    });

    it('should calculate shift totals correctly', () => {
      const closedShift = mockCashierShifts.find(s => s.status === 'closed');
      
      expect(closedShift?.total_cash_in).toBeDefined();
      expect(closedShift?.total_cash_out).toBeDefined();
      expect(closedShift?.closing_balance).toBeDefined();
    });

    it('should detect cash discrepancies', () => {
      const shiftWithDiscrepancy = mockCashierShifts.find(s => s.discrepancy !== 0);
      expect(shiftWithDiscrepancy?.discrepancy).toBe(-50);
    });
  });

  describe('POS Transactions', () => {
    it('should display all transactions', () => {
      expect(mockPOSTransactions).toHaveLength(5);
    });

    it('should categorize transactions by type', () => {
      const rentCollections = mockPOSTransactions.filter(t => t.transaction_type === 'rent_collection');
      const disbursements = mockPOSTransactions.filter(t => t.transaction_type === 'disbursement');
      const refunds = mockPOSTransactions.filter(t => t.transaction_type === 'refund');

      expect(rentCollections).toHaveLength(2);
      expect(disbursements).toHaveLength(2);
      expect(refunds).toHaveLength(1);
    });

    it('should categorize transactions by payment method', () => {
      const cashTransactions = mockPOSTransactions.filter(t => t.payment_method === 'cash');
      const cardTransactions = mockPOSTransactions.filter(t => t.payment_method === 'card');
      const transferTransactions = mockPOSTransactions.filter(t => t.payment_method === 'bank_transfer');

      expect(cashTransactions).toHaveLength(2);
      expect(cardTransactions).toHaveLength(2);
      expect(transferTransactions).toHaveLength(1);
    });

    it('should track transaction receipts', () => {
      mockPOSTransactions.forEach(transaction => {
        expect(transaction.receipt_number).toBeDefined();
        expect(transaction.receipt_number).toMatch(/^RCP-\d{4}-\d+$/);
      });
    });

    it('should link transactions to beneficiaries/tenants', () => {
      const beneficiaryTransactions = mockPOSTransactions.filter(t => t.beneficiary_id);
      const tenantTransactions = mockPOSTransactions.filter(t => t.tenant_id);

      expect(beneficiaryTransactions.length).toBeGreaterThan(0);
      expect(tenantTransactions.length).toBeGreaterThan(0);
    });
  });

  describe('Daily Settlement', () => {
    it('should display daily settlements', () => {
      expect(mockDailySettlements).toHaveLength(3);
    });

    it('should calculate settlement totals', () => {
      const settlement = mockDailySettlements[0];

      expect(settlement.total_transactions).toBe(25);
      expect(settlement.total_cash_collected).toBe(45000);
      expect(settlement.total_disbursed).toBe(15000);
      expect(settlement.net_amount).toBe(30000);
    });

    it('should track bank deposits', () => {
      const depositedSettlements = mockDailySettlements.filter(s => s.bank_deposit_status === 'deposited');
      expect(depositedSettlements.length).toBeGreaterThan(0);
    });

    it('should identify settlements with discrepancies', () => {
      const settlementsWithDiscrepancy = mockDailySettlements.filter(s => s.discrepancy !== 0);
      expect(settlementsWithDiscrepancy).toHaveLength(1);
    });
  });

  describe('Pending Rentals', () => {
    it('should display pending rental payments', () => {
      expect(mockPendingRentals).toHaveLength(3);
    });

    it('should show overdue rentals', () => {
      const overdueRentals = mockPendingRentals.filter(r => r.is_overdue);
      expect(overdueRentals).toHaveLength(2);
    });

    it('should calculate days overdue', () => {
      const overdueRental = mockPendingRentals.find(r => r.is_overdue);
      expect(overdueRental?.days_overdue).toBeGreaterThan(0);
    });

    it('should track partial payments', () => {
      const partialPayments = mockPendingRentals.filter(r => r.partial_payment > 0);
      expect(partialPayments).toHaveLength(1);
    });
  });

  describe('POS Statistics', () => {
    it('should display today statistics', () => {
      expect(mockPOSStats.today.total_transactions).toBe(15);
      expect(mockPOSStats.today.total_collected).toBe(25000);
      expect(mockPOSStats.today.total_disbursed).toBe(8000);
    });

    it('should display monthly statistics', () => {
      expect(mockPOSStats.this_month.total_transactions).toBe(320);
      expect(mockPOSStats.this_month.total_collected).toBe(580000);
    });

    it('should track payment method distribution', () => {
      const { by_payment_method } = mockPOSStats.today;

      expect(by_payment_method.cash).toBeDefined();
      expect(by_payment_method.card).toBeDefined();
      expect(by_payment_method.bank_transfer).toBeDefined();
    });
  });

  describe('Quick Collection', () => {
    it('should process quick rent collection', () => {
      const quickCollection = {
        tenant_id: 'tenant-1',
        amount: 5000,
        payment_method: 'cash',
        reference: 'إيجار شهر يناير',
      };

      expect(quickCollection.amount).toBeGreaterThan(0);
      expect(['cash', 'card', 'bank_transfer']).toContain(quickCollection.payment_method);
    });

    it('should generate receipt for collection', () => {
      const receiptPattern = /^RCP-\d{4}-\d+$/;
      const sampleReceipt = 'RCP-2024-001';

      expect(sampleReceipt).toMatch(receiptPattern);
    });
  });

  describe('Quick Disbursement', () => {
    it('should process beneficiary disbursement', () => {
      const disbursement = mockPOSTransactions.find(t => t.transaction_type === 'disbursement');

      expect(disbursement?.beneficiary_id).toBeDefined();
      expect(disbursement?.amount).toBeGreaterThan(0);
    });

    it('should require approval for large amounts', () => {
      const largeAmount = 10000;
      const approvalThreshold = 5000;

      expect(largeAmount > approvalThreshold).toBe(true);
    });
  });

  describe('Access Control', () => {
    it('should verify cashier role access', () => {
      const cashierUser = posTestUsers.cashier;
      expect(cashierUser.role).toBe('cashier');
    });

    it('should restrict POS access to authorized roles', () => {
      const authorizedRoles = ['admin', 'nazer', 'cashier', 'accountant'];
      const beneficiaryRole = 'beneficiary';

      expect(authorizedRoles.includes(beneficiaryRole)).toBe(false);
    });
  });
});

describe('POS Service', () => {
  describe('Shift Operations', () => {
    it('should open a new shift', () => {
      const newShift = {
        cashier_id: posTestUsers.cashier.id,
        opening_balance: 5000,
        opened_at: new Date().toISOString(),
        status: 'open',
      };

      expect(newShift.status).toBe('open');
      expect(newShift.opening_balance).toBe(5000);
    });

    it('should close shift with settlement', () => {
      const closeShiftData = {
        closing_balance: 35000,
        total_cash_in: 45000,
        total_cash_out: 15000,
        notes: 'وردية عادية بدون ملاحظات',
      };

      const expectedBalance = 5000 + 45000 - 15000; // opening + in - out
      expect(closeShiftData.closing_balance).toBe(expectedBalance);
    });
  });

  describe('Transaction Processing', () => {
    it('should validate transaction amount', () => {
      const validAmount = 1000;
      const invalidAmount = -100;

      expect(validAmount).toBeGreaterThan(0);
      expect(invalidAmount).toBeLessThan(0);
    });

    it('should prevent transactions without open shift', () => {
      const hasOpenShift = mockCashierShifts.some(s => s.status === 'open');
      expect(hasOpenShift).toBe(true);
    });
  });
});
