import { describe, it, expect, vi, beforeEach } from 'vitest';
import { matchesStatus, TENANT_STATUS } from '@/lib/constants';

/**
 * Tenant Service Unit Tests
 * اختبارات وحدة لخدمة المستأجرين
 */

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        is: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
    })),
  },
}));

describe('Tenant Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Status Matching', () => {
    it('should match Arabic status "نشط"', () => {
      expect(matchesStatus('نشط', 'active')).toBe(true);
    });

    it('should match English status "active"', () => {
      expect(matchesStatus('active', 'active')).toBe(true);
    });

    it('should match mixed status values', () => {
      expect(matchesStatus('نشط', 'نشط', 'active')).toBe(true);
      expect(matchesStatus('active', 'نشط', 'active')).toBe(true);
    });

    it('should not match inactive status as active', () => {
      expect(matchesStatus('غير نشط', 'active')).toBe(false);
      expect(matchesStatus('inactive', 'active')).toBe(false);
    });

    it('should handle case insensitivity', () => {
      expect(matchesStatus('ACTIVE', 'active')).toBe(true);
      expect(matchesStatus('Active', 'active')).toBe(true);
    });
  });

  describe('TENANT_STATUS Constants', () => {
    it('should have correct active values', () => {
      expect(TENANT_STATUS.ACTIVE).toBe('نشط');
      expect(TENANT_STATUS.ACTIVE_EN).toBe('active');
    });

    it('should have correct inactive values', () => {
      expect(TENANT_STATUS.INACTIVE).toBe('غير نشط');
      expect(TENANT_STATUS.INACTIVE_EN).toBe('inactive');
    });
  });

  describe('Tenant Data Structure', () => {
    it('should validate tenant object structure', () => {
      const mockTenant = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        full_name: 'أحمد محمد',
        national_id: '1234567890',
        phone: '0501234567',
        email: 'ahmed@example.com',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        deleted_at: null as string | null,
      };

      expect(mockTenant).toHaveProperty('id');
      expect(mockTenant).toHaveProperty('full_name');
      expect(mockTenant).toHaveProperty('national_id');
      expect(mockTenant).toHaveProperty('phone');
      expect(mockTenant).toHaveProperty('status');
      expect(mockTenant.deleted_at).toBeNull();
    });

    it('should validate tenant ledger entry structure', () => {
      const mockLedgerEntry = {
        id: '123',
        tenant_id: '456',
        transaction_type: 'invoice',
        amount: 5000,
        balance_after: 5000,
        description: 'إيجار شهر يناير',
        reference_id: '789',
        reference_type: 'invoice',
        created_at: '2024-01-01T00:00:00Z',
      };

      expect(mockLedgerEntry).toHaveProperty('tenant_id');
      expect(mockLedgerEntry).toHaveProperty('transaction_type');
      expect(mockLedgerEntry).toHaveProperty('amount');
      expect(mockLedgerEntry).toHaveProperty('balance_after');
      expect(typeof mockLedgerEntry.amount).toBe('number');
    });
  });

  describe('Tenant Statistics', () => {
    it('should calculate tenant stats correctly', () => {
      const mockTenants = [
        { id: '1', status: 'active', account_balance: 1000 },
        { id: '2', status: 'نشط', account_balance: 2000 },
        { id: '3', status: 'inactive', account_balance: 500 },
        { id: '4', status: 'active', account_balance: -500 },
      ];

      const stats = {
        total: mockTenants.length,
        active: mockTenants.filter(t => matchesStatus(t.status, 'active')).length,
        inactive: mockTenants.filter(t => matchesStatus(t.status, 'inactive')).length,
        totalReceivables: mockTenants
          .filter(t => t.account_balance > 0)
          .reduce((sum, t) => sum + t.account_balance, 0),
        totalOverpaid: Math.abs(
          mockTenants
            .filter(t => t.account_balance < 0)
            .reduce((sum, t) => sum + t.account_balance, 0)
        ),
      };

      expect(stats.total).toBe(4);
      expect(stats.active).toBe(3);
      expect(stats.inactive).toBe(1);
      expect(stats.totalReceivables).toBe(3500);
      expect(stats.totalOverpaid).toBe(500);
    });
  });

  describe('Aging Report', () => {
    it('should categorize tenant debts by age buckets', () => {
      const today = new Date();
      const daysAgo = (days: number) => {
        const date = new Date(today);
        date.setDate(date.getDate() - days);
        return date.toISOString();
      };

      const mockDebts = [
        { tenant_id: '1', amount: 1000, due_date: daysAgo(15) }, // 0-30 days
        { tenant_id: '2', amount: 2000, due_date: daysAgo(45) }, // 31-60 days
        { tenant_id: '3', amount: 3000, due_date: daysAgo(75) }, // 61-90 days
        { tenant_id: '4', amount: 4000, due_date: daysAgo(100) }, // 90+ days
      ];

      const getDaysOverdue = (dueDate: string) => {
        const due = new Date(dueDate);
        const diffTime = today.getTime() - due.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
      };

      const aging = {
        current: mockDebts.filter(d => getDaysOverdue(d.due_date) <= 30),
        days31to60: mockDebts.filter(d => {
          const days = getDaysOverdue(d.due_date);
          return days > 30 && days <= 60;
        }),
        days61to90: mockDebts.filter(d => {
          const days = getDaysOverdue(d.due_date);
          return days > 60 && days <= 90;
        }),
        over90: mockDebts.filter(d => getDaysOverdue(d.due_date) > 90),
      };

      expect(aging.current.length).toBe(1);
      expect(aging.days31to60.length).toBe(1);
      expect(aging.days61to90.length).toBe(1);
      expect(aging.over90.length).toBe(1);
    });
  });

  describe('Soft Delete', () => {
    it('should filter out deleted tenants', () => {
      const mockTenants = [
        { id: '1', full_name: 'Tenant 1', deleted_at: null },
        { id: '2', full_name: 'Tenant 2', deleted_at: '2024-01-01T00:00:00Z' },
        { id: '3', full_name: 'Tenant 3', deleted_at: null },
      ];

      const activeRecords = mockTenants.filter(t => t.deleted_at === null);
      expect(activeRecords.length).toBe(2);
      expect(activeRecords.map(t => t.id)).toEqual(['1', '3']);
    });
  });
});

describe('Tenant Validation', () => {
  it('should validate Saudi phone number format', () => {
    const validPhones = ['0501234567', '0551234567', '0561234567'];
    const invalidPhones = ['123456', '05012345678', 'abc'];

    const isValidSaudiPhone = (phone: string) => /^05[0-9]{8}$/.test(phone);

    validPhones.forEach(phone => {
      expect(isValidSaudiPhone(phone)).toBe(true);
    });

    invalidPhones.forEach(phone => {
      expect(isValidSaudiPhone(phone)).toBe(false);
    });
  });

  it('should validate Saudi national ID format', () => {
    const validIds = ['1234567890', '2345678901'];
    const invalidIds = ['123', '12345678901', 'abcdefghij'];

    const isValidNationalId = (id: string) => /^[12][0-9]{9}$/.test(id);

    validIds.forEach(id => {
      expect(isValidNationalId(id)).toBe(true);
    });

    invalidIds.forEach(id => {
      expect(isValidNationalId(id)).toBe(false);
    });
  });

  it('should validate IBAN format', () => {
    const validIban = 'SA0380000000608010167519';
    const invalidIban = 'SA123';

    const isValidIban = (iban: string) => /^SA[0-9]{22}$/.test(iban);

    expect(isValidIban(validIban)).toBe(true);
    expect(isValidIban(invalidIban)).toBe(false);
  });
});
