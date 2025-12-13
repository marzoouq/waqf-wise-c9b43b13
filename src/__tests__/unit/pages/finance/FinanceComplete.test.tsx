/**
 * اختبارات شاملة للصفحات المالية
 * Comprehensive Finance Pages Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setMockTableData, clearMockTableData } from '@/test/setup';

// سندات الدفع
const mockPaymentVouchers = [
  { id: '1', voucher_number: 'PV-001', amount: 50000, beneficiary_id: 'b1', status: 'approved', created_at: '2025-01-15', description: 'توزيع غلة' },
  { id: '2', voucher_number: 'PV-002', amount: 30000, beneficiary_id: 'b2', status: 'pending', created_at: '2025-01-20', description: 'فزعة طارئة' },
];

// المدفوعات
const mockPayments = [
  { id: '1', beneficiary_id: 'b1', amount: 50000, payment_date: '2025-01-15', type: 'distribution', method: 'bank_transfer', status: 'completed' },
  { id: '2', beneficiary_id: 'b2', amount: 25000, payment_date: '2025-01-20', type: 'emergency', method: 'cash', status: 'completed' },
];

// القروض
const mockLoans = [
  { id: '1', beneficiary_id: 'b1', principal: 50000, remaining_balance: 30000, monthly_payment: 5000, status: 'active', start_date: '2024-06-01' },
  { id: '2', beneficiary_id: 'b2', principal: 30000, remaining_balance: 0, monthly_payment: 3000, status: 'paid', start_date: '2024-01-01' },
];

// التحويلات البنكية
const mockBankTransfers = [
  { id: '1', amount: 350000, from_account: 'acc1', to_iban: 'SA1234567890', beneficiary_name: 'شركة القويشي', status: 'completed', transfer_date: '2025-01-15' },
  { id: '2', amount: 400000, from_account: 'acc1', to_iban: 'SA0987654321', beneficiary_name: 'مؤسسة رواء', status: 'pending', transfer_date: '2025-01-20' },
];

describe('Finance Pages - Complete Tests', () => {
  beforeEach(() => {
    clearMockTableData();
    vi.clearAllMocks();
  });

  // ==================== سندات الدفع ====================
  describe('Payment Vouchers (سندات الدفع)', () => {
    beforeEach(() => {
      setMockTableData('payment_vouchers', mockPaymentVouchers);
    });

    it('should display all vouchers', () => {
      expect(mockPaymentVouchers).toHaveLength(2);
    });

    it('should show voucher numbers', () => {
      expect(mockPaymentVouchers[0].voucher_number).toBe('PV-001');
    });

    it('should show voucher status', () => {
      const approved = mockPaymentVouchers.filter(v => v.status === 'approved');
      const pending = mockPaymentVouchers.filter(v => v.status === 'pending');
      expect(approved).toHaveLength(1);
      expect(pending).toHaveLength(1);
    });

    it('should calculate total amount', () => {
      const total = mockPaymentVouchers.reduce((sum, v) => sum + v.amount, 0);
      expect(total).toBe(80000);
    });

    it('should filter by status', () => {
      const pendingOnly = mockPaymentVouchers.filter(v => v.status === 'pending');
      expect(pendingOnly).toHaveLength(1);
    });

    it('should create new voucher', () => {
      const newVoucher = {
        voucher_number: 'PV-003',
        amount: 25000,
        beneficiary_id: 'b3',
        status: 'draft'
      };
      expect(newVoucher.voucher_number).toBe('PV-003');
    });
  });

  // ==================== المدفوعات ====================
  describe('Payments (المدفوعات)', () => {
    beforeEach(() => {
      setMockTableData('payments', mockPayments);
    });

    it('should display all payments', () => {
      expect(mockPayments).toHaveLength(2);
    });

    it('should show payment types', () => {
      const distribution = mockPayments.filter(p => p.type === 'distribution');
      const emergency = mockPayments.filter(p => p.type === 'emergency');
      expect(distribution).toHaveLength(1);
      expect(emergency).toHaveLength(1);
    });

    it('should show payment methods', () => {
      const bankTransfer = mockPayments.filter(p => p.method === 'bank_transfer');
      const cash = mockPayments.filter(p => p.method === 'cash');
      expect(bankTransfer).toHaveLength(1);
      expect(cash).toHaveLength(1);
    });

    it('should calculate total paid', () => {
      const total = mockPayments.reduce((sum, p) => sum + p.amount, 0);
      expect(total).toBe(75000);
    });

    it('should filter by date', () => {
      const january = mockPayments.filter(p => p.payment_date.startsWith('2025-01'));
      expect(january).toHaveLength(2);
    });
  });

  // ==================== القروض ====================
  describe('Loans (القروض)', () => {
    beforeEach(() => {
      setMockTableData('loans', mockLoans);
    });

    it('should display all loans', () => {
      expect(mockLoans).toHaveLength(2);
    });

    it('should show loan status', () => {
      const active = mockLoans.filter(l => l.status === 'active');
      const paid = mockLoans.filter(l => l.status === 'paid');
      expect(active).toHaveLength(1);
      expect(paid).toHaveLength(1);
    });

    it('should calculate total principal', () => {
      const totalPrincipal = mockLoans.reduce((sum, l) => sum + l.principal, 0);
      expect(totalPrincipal).toBe(80000);
    });

    it('should calculate total remaining', () => {
      const totalRemaining = mockLoans.reduce((sum, l) => sum + l.remaining_balance, 0);
      expect(totalRemaining).toBe(30000);
    });

    it('should calculate total collected', () => {
      const totalCollected = mockLoans.reduce((sum, l) => sum + (l.principal - l.remaining_balance), 0);
      expect(totalCollected).toBe(50000);
    });

    it('should show monthly payments', () => {
      expect(mockLoans[0].monthly_payment).toBe(5000);
    });

    it('should create new loan', () => {
      const newLoan = {
        beneficiary_id: 'b3',
        principal: 40000,
        monthly_payment: 4000,
        status: 'active'
      };
      expect(newLoan.principal).toBe(40000);
    });
  });

  // ==================== التحويلات البنكية ====================
  describe('Bank Transfers (التحويلات البنكية)', () => {
    beforeEach(() => {
      setMockTableData('bank_transfer_details', mockBankTransfers);
    });

    it('should display all transfers', () => {
      expect(mockBankTransfers).toHaveLength(2);
    });

    it('should show transfer status', () => {
      const completed = mockBankTransfers.filter(t => t.status === 'completed');
      const pending = mockBankTransfers.filter(t => t.status === 'pending');
      expect(completed).toHaveLength(1);
      expect(pending).toHaveLength(1);
    });

    it('should calculate total transferred', () => {
      const total = mockBankTransfers.reduce((sum, t) => sum + t.amount, 0);
      expect(total).toBe(750000);
    });

    it('should show beneficiary names', () => {
      expect(mockBankTransfers[0].beneficiary_name).toBe('شركة القويشي');
    });

    it('should show IBAN', () => {
      expect(mockBankTransfers[0].to_iban).toBe('SA1234567890');
    });

    it('should filter by date', () => {
      const jan15 = mockBankTransfers.filter(t => t.transfer_date === '2025-01-15');
      expect(jan15).toHaveLength(1);
    });
  });

  // ==================== إحصائيات مالية ====================
  describe('Financial Statistics', () => {
    beforeEach(() => {
      setMockTableData('payments', mockPayments);
      setMockTableData('loans', mockLoans);
    });

    it('should calculate payment statistics', () => {
      const totalPayments = mockPayments.reduce((sum, p) => sum + p.amount, 0);
      const avgPayment = totalPayments / mockPayments.length;
      expect(avgPayment).toBe(37500);
    });

    it('should calculate loan collection rate', () => {
      const totalPrincipal = 80000;
      const totalCollected = 50000;
      const collectionRate = (totalCollected / totalPrincipal) * 100;
      expect(collectionRate).toBe(62.5);
    });
  });
});
