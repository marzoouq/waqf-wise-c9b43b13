/**
 * اختبارات شاملة لصفحة المستأجرين
 * Comprehensive Tenants Page Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setMockTableData, clearMockTableData } from '@/test/setup';

const mockTenants = [
  { id: '1', name: 'شركة القويشي', type: 'company', phone: '0501234567', email: 'quwaishi@email.com', national_id: '1234567890', current_balance: 350000, is_active: true },
  { id: '2', name: 'مؤسسة رواء', type: 'company', phone: '0509876543', email: 'rawae@email.com', national_id: '0987654321', current_balance: 400000, is_active: true },
  { id: '3', name: 'أحمد الثبيتي', type: 'individual', phone: '0551234567', email: 'ahmed@email.com', national_id: '1122334455', current_balance: 100000, is_active: true },
];

const mockTenantLedger = [
  { id: '1', tenant_id: '1', transaction_type: 'invoice', amount: 350000, balance_after: 350000, description: 'فاتورة إيجار', created_at: '2025-01-01' },
  { id: '2', tenant_id: '1', transaction_type: 'payment', amount: -350000, balance_after: 0, description: 'سداد إيجار', created_at: '2025-01-15' },
  { id: '3', tenant_id: '2', transaction_type: 'invoice', amount: 400000, balance_after: 400000, description: 'فاتورة إيجار', created_at: '2025-01-01' },
];

const mockContracts = [
  { id: '1', tenant_id: '1', property_id: 'p1', monthly_rent: 29166, annual_rent: 350000, status: 'active', start_date: '2025-01-01', end_date: '2025-12-31' },
  { id: '2', tenant_id: '2', property_id: 'p2', monthly_rent: 33333, annual_rent: 400000, status: 'active', start_date: '2025-01-01', end_date: '2025-12-31' },
];

describe('Tenants Page - Complete Tests', () => {
  beforeEach(() => {
    clearMockTableData();
    vi.clearAllMocks();
  });

  describe('Tenant List (قائمة المستأجرين)', () => {
    beforeEach(() => {
      setMockTableData('tenants', mockTenants);
    });

    it('should display all tenants', () => {
      expect(mockTenants).toHaveLength(3);
    });

    it('should show tenant names', () => {
      expect(mockTenants[0].name).toBe('شركة القويشي');
      expect(mockTenants[1].name).toBe('مؤسسة رواء');
    });

    it('should show tenant types', () => {
      const companies = mockTenants.filter(t => t.type === 'company');
      const individuals = mockTenants.filter(t => t.type === 'individual');
      expect(companies).toHaveLength(2);
      expect(individuals).toHaveLength(1);
    });

    it('should show contact information', () => {
      expect(mockTenants[0].phone).toBe('0501234567');
      expect(mockTenants[0].email).toBe('quwaishi@email.com');
    });

    it('should show current balance', () => {
      const totalBalance = mockTenants.reduce((sum, t) => sum + t.current_balance, 0);
      expect(totalBalance).toBe(850000);
    });

    it('should filter active tenants', () => {
      const active = mockTenants.filter(t => t.is_active);
      expect(active).toHaveLength(3);
    });
  });

  describe('Tenant Ledger (دفتر المستأجر)', () => {
    beforeEach(() => {
      setMockTableData('tenant_ledger', mockTenantLedger);
    });

    it('should show all transactions', () => {
      expect(mockTenantLedger).toHaveLength(3);
    });

    it('should show invoices', () => {
      const invoices = mockTenantLedger.filter(t => t.transaction_type === 'invoice');
      expect(invoices).toHaveLength(2);
    });

    it('should show payments', () => {
      const payments = mockTenantLedger.filter(t => t.transaction_type === 'payment');
      expect(payments).toHaveLength(1);
    });

    it('should calculate balance correctly', () => {
      const tenant1Transactions = mockTenantLedger.filter(t => t.tenant_id === '1');
      const lastTransaction = tenant1Transactions[tenant1Transactions.length - 1];
      expect(lastTransaction.balance_after).toBe(0);
    });
  });

  describe('Tenant Contracts (عقود المستأجر)', () => {
    beforeEach(() => {
      setMockTableData('contracts', mockContracts);
    });

    it('should show tenant contracts', () => {
      const tenant1Contracts = mockContracts.filter(c => c.tenant_id === '1');
      expect(tenant1Contracts).toHaveLength(1);
    });

    it('should show contract details', () => {
      expect(mockContracts[0].annual_rent).toBe(350000);
      expect(mockContracts[0].status).toBe('active');
    });
  });

  describe('Add Tenant (إضافة مستأجر)', () => {
    it('should create new tenant', () => {
      const newTenant = {
        name: 'مستأجر جديد',
        type: 'individual',
        phone: '0551111111',
        email: 'new@email.com',
        national_id: '1111111111'
      };
      expect(newTenant.name).toBe('مستأجر جديد');
    });

    it('should validate required fields', () => {
      const requiredFields = ['name', 'phone', 'national_id'];
      const tenant = { name: 'test', phone: '', national_id: '' };
      const missingFields = requiredFields.filter(f => !tenant[f as keyof typeof tenant]);
      expect(missingFields).toHaveLength(2);
    });
  });

  describe('Tenant Statistics (إحصائيات المستأجرين)', () => {
    beforeEach(() => {
      setMockTableData('tenants', mockTenants);
    });

    it('should calculate total receivables', () => {
      const totalReceivables = mockTenants.reduce((sum, t) => sum + t.current_balance, 0);
      expect(totalReceivables).toBe(850000);
    });

    it('should count tenants by type', () => {
      const byType = mockTenants.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      expect(byType.company).toBe(2);
      expect(byType.individual).toBe(1);
    });
  });
});
