/**
 * اختبارات خدمة القروض
 * Loan Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoansService } from '@/services/loans.service';
import { supabase } from '@/integrations/supabase/client';
import { setMockTableData, clearMockTableData } from '../../utils/supabase.mock';

const mockLoans = [
  {
    id: 'loan-1',
    beneficiary_id: 'ben-1',
    loan_amount: 50000,
    remaining_amount: 25000,
    status: 'نشط',
    loan_type: 'قرض حسن',
    start_date: '2024-01-01',
    term_months: 12,
    created_at: '2024-01-01T00:00:00Z',
  },
];

describe('LoansService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('getAll', () => {
    it('should fetch all loans', async () => {
      setMockTableData('loans', mockLoans);

      const result = await LoansService.getAll();
      
      expect(supabase.from).toHaveBeenCalledWith('loans');
      expect(result).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should fetch loan by ID', async () => {
      setMockTableData('loans', mockLoans);

      const result = await LoansService.getById('loan-1');
      
      expect(result).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create new loan', async () => {
      const newLoan = {
        beneficiary_id: 'ben-1',
        loan_amount: 30000,
        loan_type: 'قرض حسن',
        start_date: '2024-01-01',
        term_months: 12,
      };

      setMockTableData('loans', [{ id: 'new-loan', ...newLoan }]);

      const result = await LoansService.create(newLoan);
      
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update loan', async () => {
      setMockTableData('loans', mockLoans);

      const result = await LoansService.update('loan-1', { status: 'مكتمل' });
      
      expect(result).toBeDefined();
    });
  });
});
