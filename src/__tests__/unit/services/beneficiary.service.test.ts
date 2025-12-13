/**
 * اختبارات خدمة المستفيدين
 * Beneficiary Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BeneficiaryService } from '@/services/beneficiary.service';
import { supabase } from '@/integrations/supabase/client';
import { mockBeneficiaries } from '../../utils/data.fixtures';
import { setMockTableData, clearMockTableData } from '@/test/setup';

describe('BeneficiaryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('getAll', () => {
    it('should fetch all beneficiaries', async () => {
      setMockTableData('beneficiaries', mockBeneficiaries);

      const result = await BeneficiaryService.getAll();
      
      expect(supabase.from).toHaveBeenCalledWith('beneficiaries');
      expect(result).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should fetch beneficiary by ID', async () => {
      const testBeneficiary = mockBeneficiaries[0];
      setMockTableData('beneficiaries', [testBeneficiary]);

      const result = await BeneficiaryService.getById(testBeneficiary.id);
      
      expect(result).toBeDefined();
    });
  });

  describe('getBeneficiaryIdByUserId', () => {
    it('should fetch beneficiary ID by user ID', async () => {
      setMockTableData('beneficiaries', mockBeneficiaries);

      const result = await BeneficiaryService.getBeneficiaryIdByUserId('user-1');
      
      expect(supabase.from).toHaveBeenCalledWith('beneficiaries');
    });
  });

  describe('getBeneficiaryPayments', () => {
    it('should fetch payments for beneficiary', async () => {
      const beneficiaryId = mockBeneficiaries[0].id;
      setMockTableData('payments', [
        { id: 'pay-1', beneficiary_id: beneficiaryId, amount: 1000 },
      ]);

      const result = await BeneficiaryService.getBeneficiaryPayments(beneficiaryId);
      
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
