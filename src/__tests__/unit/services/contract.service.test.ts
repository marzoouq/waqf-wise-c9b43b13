/**
 * اختبارات خدمة العقود
 * Contract Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContractService } from '@/services/contract.service';
import { mockSupabase, setMockTableData, clearMockTableData } from '../../utils/supabase.mock';
import { mockContracts } from '../../utils/data.fixtures';

describe('ContractService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('getAll', () => {
    it('should fetch all contracts', async () => {
      setMockTableData('contracts', mockContracts);

      const result = await ContractService.getAll();
      
      expect(mockSupabase.from).toHaveBeenCalledWith('contracts');
      expect(result).toBeDefined();
    });

    it('should filter contracts by status', async () => {
      const activeContracts = mockContracts.filter(c => c.status === 'نشط');
      setMockTableData('contracts', activeContracts);

      const result = await ContractService.getAll({ status: 'نشط' });
      
      expect(result).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should fetch contract by ID', async () => {
      const testContract = mockContracts[0];
      setMockTableData('contracts', [testContract]);

      const result = await ContractService.getById(testContract.id);
      
      expect(result).toBeDefined();
    });
  });

  describe('getByPropertyId', () => {
    it('should fetch contracts by property ID', async () => {
      setMockTableData('contracts', mockContracts);

      const result = await ContractService.getByPropertyId('prop-1');
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('create', () => {
    it('should create new contract', async () => {
      const newContract = {
        property_id: 'prop-1',
        tenant_id: 'tenant-1',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        monthly_rent: 5000,
        status: 'نشط',
        contract_number: 'CNT-001',
        contract_type: 'سكني',
        tenant_id_number: '1234567890',
        tenant_name: 'أحمد محمد',
        tenant_phone: '0501234567',
      };

      setMockTableData('contracts', [{ id: 'new-id', ...newContract }]);

      const result = await ContractService.create(newContract);
      
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update existing contract', async () => {
      const existingContract = mockContracts[0];
      const updates = { monthly_rent: 6000 };

      setMockTableData('contracts', [{ ...existingContract, ...updates }]);

      const result = await ContractService.update(existingContract.id, updates);
      
      expect(result).toBeDefined();
    });
  });

  describe('terminate', () => {
    it('should terminate contract', async () => {
      const existingContract = mockContracts[0];
      setMockTableData('contracts', [{ ...existingContract, status: 'منتهي' }]);

      const result = await ContractService.terminate(existingContract.id);
      
      expect(result).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete contract', async () => {
      setMockTableData('contracts', mockContracts);

      await ContractService.delete(mockContracts[0].id);
      
      expect(mockSupabase.from).toHaveBeenCalledWith('contracts');
    });
  });
});
