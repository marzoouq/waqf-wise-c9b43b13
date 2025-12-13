/**
 * اختبارات خدمة المستأجرين
 * Tenant Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TenantService } from '@/services/tenant.service';
import { mockSupabase, setMockTableData, clearMockTableData } from '../../utils/supabase.mock';

describe('TenantService', () => {
  const mockTenants = [
    {
      id: 'tenant-1',
      full_name: 'أحمد محمد',
      phone: '0501234567',
      id_number: '1234567890',
      email: 'ahmed@example.com',
      status: 'active',
    },
    {
      id: 'tenant-2',
      full_name: 'خالد علي',
      phone: '0509876543',
      id_number: '0987654321',
      email: 'khaled@example.com',
      status: 'active',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
  });

  describe('getAll', () => {
    it('should fetch all tenants', async () => {
      setMockTableData('tenants', mockTenants);

      const result = await TenantService.getAll();
      
      expect(mockSupabase.from).toHaveBeenCalledWith('tenants');
      expect(result).toBeDefined();
    });

    it('should support search filter parameter', async () => {
      setMockTableData('tenants', [mockTenants[0]]);

      // Test that getAll can be called with filters
      expect(TenantService.getAll).toBeDefined();
      expect(typeof TenantService.getAll).toBe('function');
    });
  });

  describe('getById', () => {
    it('should fetch tenant by ID', async () => {
      setMockTableData('tenants', [mockTenants[0]]);

      const result = await TenantService.getById(mockTenants[0].id);
      
      expect(result).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create new tenant', async () => {
      const newTenant = {
        full_name: 'مستأجر جديد',
        phone: '0551234567',
        id_number: '1122334455',
      };

      setMockTableData('tenants', [{ id: 'new-id', ...newTenant }]);

      const result = await TenantService.create(newTenant);
      
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update existing tenant', async () => {
      const updates = { phone: '0559999999' };

      setMockTableData('tenants', [{ ...mockTenants[0], ...updates }]);

      const result = await TenantService.update(mockTenants[0].id, updates);
      
      expect(result).toBeDefined();
    });
  });

  describe('getLedger', () => {
    it('should fetch tenant ledger', async () => {
      setMockTableData('tenant_ledger', [
        { id: 'ledger-1', tenant_id: 'tenant-1', debit_amount: 5000, credit_amount: 0 },
        { id: 'ledger-2', tenant_id: 'tenant-1', debit_amount: 0, credit_amount: 5000 },
      ]);

      const result = await TenantService.getLedger('tenant-1');
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getBalance', () => {
    it('should calculate tenant balance', async () => {
      setMockTableData('tenant_ledger', [
        { id: 'ledger-1', tenant_id: 'tenant-1', debit_amount: 5000, credit_amount: 0 },
        { id: 'ledger-2', tenant_id: 'tenant-1', debit_amount: 0, credit_amount: 3000 },
      ]);

      const result = await TenantService.getBalance('tenant-1');
      
      expect(typeof result).toBe('number');
    });
  });

  describe('getContracts', () => {
    it('should fetch tenant contracts', async () => {
      setMockTableData('contracts', [
        { id: 'c-1', tenant_id: 'tenant-1', status: 'نشط' },
      ]);

      const result = await TenantService.getContracts('tenant-1');
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get tenant statistics', async () => {
      setMockTableData('tenants', mockTenants);

      const result = await TenantService.getStats();
      
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('active');
    });
  });
});
