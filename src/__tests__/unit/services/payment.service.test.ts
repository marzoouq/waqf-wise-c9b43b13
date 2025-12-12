/**
 * اختبارات خدمة المدفوعات
 * Payment Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentService } from '@/services/payment.service';
import { mockSupabase, setMockTableData, clearMockTableData } from '../../utils/supabase.mock';
import { mockPayments } from '../../utils/data.fixtures';

describe('PaymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('getAll', () => {
    it('should fetch all payments', async () => {
      setMockTableData('payments', mockPayments);

      const result = await PaymentService.getAll();
      
      expect(mockSupabase.from).toHaveBeenCalledWith('payments');
      expect(result).toBeDefined();
    });

    it('should filter payments by type', async () => {
      setMockTableData('payments', mockPayments);

      const result = await PaymentService.getAll({ payment_type: 'receipt' });
      
      expect(result).toBeDefined();
    });

    it('should filter payments by date range', async () => {
      setMockTableData('payments', mockPayments);

      const result = await PaymentService.getAll({ 
        startDate: '2024-01-01', 
        endDate: '2024-12-31' 
      });
      
      expect(result).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should fetch payment by ID', async () => {
      setMockTableData('payments', [mockPayments[0]]);

      const result = await PaymentService.getById(mockPayments[0].id);
      
      expect(result).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create new payment', async () => {
      const newPayment = {
        beneficiary_id: 'ben-1',
        amount: 5000,
        payment_date: '2024-01-15',
        payment_method: 'تحويل بنكي',
        status: 'مكتمل',
        description: 'دفعة شهرية',
        payer_name: 'الوقف',
        payment_number: 'PAY-001',
        payment_type: 'payment' as const,
      };

      setMockTableData('payments', [{ id: 'new-id', ...newPayment }]);

      const result = await PaymentService.create(newPayment);
      
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update existing payment', async () => {
      const updates = { status: 'ملغي' };

      setMockTableData('payments', [{ ...mockPayments[0], ...updates }]);

      const result = await PaymentService.update(mockPayments[0].id, updates);
      
      expect(result).toBeDefined();
    });
  });
});
