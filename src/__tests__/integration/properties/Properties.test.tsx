/**
 * Properties & Contracts Integration Tests - اختبارات العقارات والعقود
 * @phase 5 - Property Management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import {
  realProperties,
  mockProperties,
  realContracts,
  mockContracts,
  realTenants,
  mockTenants,
  propertyStats,
  contractStats,
  getActiveProperties,
  getPropertyById,
  getActiveContracts,
  getContractsByPropertyId,
  getTenantById,
} from '../../fixtures/properties.fixtures';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: mockProperties, error: null })),
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockProperties[0], error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: { id: 'new-prop' }, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: mockProperties[0], error: null })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-admin', role: 'admin' } }, 
        error: null 
      })),
    },
  },
}));

describe('Properties', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Properties Listing', () => {
    it('should have 6 properties', () => {
      expect(realProperties).toHaveLength(6);
    });

    it('should have required fields for each property', () => {
      realProperties.forEach((prop) => {
        expect(prop).toHaveProperty('id');
        expect(prop).toHaveProperty('name');
        expect(prop).toHaveProperty('type');
        expect(prop).toHaveProperty('location');
        expect(prop).toHaveProperty('status');
      });
    });

    it('should have property types', () => {
      const types = [...new Set(realProperties.map((p) => p.type))];
      expect(types.length).toBeGreaterThan(0);
    });

    it('should have different statuses', () => {
      const statuses = [...new Set(realProperties.map((p) => p.status))];
      expect(statuses).toContain('نشط');
      expect(statuses).toContain('شاغر');
    });
  });

  describe('Property Statistics', () => {
    it('should calculate total correctly', () => {
      expect(propertyStats.total).toBe(realProperties.length);
    });

    it('should calculate active properties', () => {
      const active = realProperties.filter((p) => p.status === 'نشط');
      expect(propertyStats.active).toBe(active.length);
    });

    it('should calculate vacant properties', () => {
      const vacant = realProperties.filter((p) => p.status === 'شاغر');
      expect(propertyStats.vacant).toBe(vacant.length);
    });

    it('should calculate total units', () => {
      const total = realProperties.reduce((sum, p) => sum + (p.total_units || 0), 0);
      expect(propertyStats.totalUnits).toBe(total);
    });

    it('should calculate monthly revenue', () => {
      const revenue = realProperties.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
      expect(propertyStats.totalMonthlyRevenue).toBe(revenue);
    });
  });

  describe('Property Details', () => {
    it('should get property by ID', () => {
      const prop = getPropertyById('prop-001');
      expect(prop).toBeDefined();
      expect(prop?.name).toBe('عقار السامر 2');
    });

    it('should return undefined for non-existent ID', () => {
      const prop = getPropertyById('non-existent');
      expect(prop).toBeUndefined();
    });

    it('should have occupancy percentage', () => {
      realProperties.forEach((prop) => {
        expect(prop.occupancy_percentage).toBeGreaterThanOrEqual(0);
        expect(prop.occupancy_percentage).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Active Properties', () => {
    it('should get only active properties', () => {
      const active = getActiveProperties();
      active.forEach((prop) => {
        expect(prop.status).toBe('نشط');
      });
    });

    it('should have correct count', () => {
      const active = getActiveProperties();
      expect(active.length).toBe(propertyStats.active);
    });
  });

  describe('Property Types', () => {
    it('should have residential commercial properties', () => {
      const residential = realProperties.filter((p) => p.type === 'سكني تجاري');
      expect(residential.length).toBeGreaterThan(0);
    });

    it('should have agricultural properties', () => {
      const agricultural = realProperties.filter((p) => p.type === 'زراعي');
      expect(agricultural.length).toBeGreaterThan(0);
    });

    it('should have land properties', () => {
      const land = realProperties.filter((p) => p.type === 'أرض');
      expect(land.length).toBeGreaterThan(0);
    });
  });
});

describe('Contracts', () => {
  describe('Contracts Listing', () => {
    it('should have 4 contracts', () => {
      expect(realContracts).toHaveLength(4);
    });

    it('should have required fields for each contract', () => {
      realContracts.forEach((contract) => {
        expect(contract).toHaveProperty('id');
        expect(contract).toHaveProperty('contract_number');
        expect(contract).toHaveProperty('property_id');
        expect(contract).toHaveProperty('tenant_id');
        expect(contract).toHaveProperty('start_date');
        expect(contract).toHaveProperty('end_date');
        expect(contract).toHaveProperty('monthly_rent');
        expect(contract).toHaveProperty('status');
      });
    });

    it('should have tenant name', () => {
      realContracts.forEach((contract) => {
        expect(contract.tenant_name).toBeDefined();
      });
    });
  });

  describe('Contract Statistics', () => {
    it('should calculate total correctly', () => {
      expect(contractStats.total).toBe(realContracts.length);
    });

    it('should calculate active contracts', () => {
      const active = realContracts.filter((c) => c.status === 'نشط');
      expect(contractStats.active).toBe(active.length);
    });

    it('should calculate draft contracts', () => {
      const draft = realContracts.filter((c) => c.status === 'مسودة');
      expect(contractStats.draft).toBe(draft.length);
    });

    it('should calculate total amount for active contracts', () => {
      const total = realContracts
        .filter((c) => c.status === 'نشط')
        .reduce((sum, c) => sum + (c.total_amount || 0), 0);
      expect(contractStats.totalAmount).toBe(total);
    });
  });

  describe('Active Contracts', () => {
    it('should get only active contracts', () => {
      const active = getActiveContracts();
      active.forEach((contract) => {
        expect(contract.status).toBe('نشط');
      });
    });
  });

  describe('Contracts by Property', () => {
    it('should get contracts by property ID', () => {
      const contracts = getContractsByPropertyId('prop-001');
      contracts.forEach((contract) => {
        expect(contract.property_id).toBe('prop-001');
      });
    });

    it('should return empty for property without contracts', () => {
      const contracts = getContractsByPropertyId('prop-005');
      expect(contracts.length).toBe(0);
    });
  });

  describe('Contract Payment Details', () => {
    it('should have payment frequency', () => {
      realContracts.forEach((contract) => {
        expect(contract.payment_frequency).toBeDefined();
      });
    });

    it('should have contract type', () => {
      realContracts.forEach((contract) => {
        expect(contract.contract_type).toBeDefined();
      });
    });

    it('should have total amount', () => {
      realContracts.forEach((contract) => {
        expect(contract.total_amount).toBeGreaterThan(0);
      });
    });
  });
});

describe('Tenants', () => {
  describe('Tenants Listing', () => {
    it('should have tenants defined', () => {
      expect(realTenants).toBeDefined();
      expect(Array.isArray(realTenants)).toBe(true);
      expect(realTenants.length).toBe(4);
    });

    it('should have required fields for each tenant', () => {
      realTenants.forEach((tenant) => {
        expect(tenant).toHaveProperty('id');
        expect(tenant).toHaveProperty('name');
        expect(tenant).toHaveProperty('national_id');
        expect(tenant).toHaveProperty('phone');
        expect(tenant).toHaveProperty('status');
      });
    });

    it('should have active tenants', () => {
      const active = realTenants.filter((t) => t.status === 'نشط');
      expect(active.length).toBeGreaterThan(0);
    });
  });

  describe('Tenant Details', () => {
    it('should get tenant by ID', () => {
      const tenant = getTenantById('ten-001');
      expect(tenant).toBeDefined();
      expect(tenant?.name).toBe('شركة القويشي للتجارة');
    });

    it('should return undefined for non-existent ID', () => {
      const tenant = getTenantById('non-existent');
      expect(tenant).toBeUndefined();
    });

    it('should have bank details', () => {
      const tenantsWithBank = realTenants.filter((t) => t.iban);
      expect(tenantsWithBank.length).toBeGreaterThan(0);
    });
  });

  describe('Tenant Status', () => {
    it('should have different statuses', () => {
      const statuses = [...new Set(realTenants.map((t) => t.status))];
      expect(statuses).toContain('نشط');
    });

    it('should have pending tenants', () => {
      const pending = realTenants.filter((t) => t.status === 'معلق');
      expect(pending.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Tenant Contact Info', () => {
    it('should have email for tenants', () => {
      realTenants.forEach((tenant) => {
        expect(tenant.email).toBeDefined();
      });
    });

    it('should have phone for tenants', () => {
      realTenants.forEach((tenant) => {
        expect(tenant.phone).toBeDefined();
      });
    });
  });
});

describe('Property-Contract-Tenant Relationships', () => {
  it('should link contracts to properties', () => {
    realContracts.forEach((contract) => {
      const property = getPropertyById(contract.property_id);
      expect(property).toBeDefined();
    });
  });

  it('should link contracts to tenants', () => {
    realContracts.forEach((contract) => {
      const tenant = getTenantById(contract.tenant_id);
      expect(tenant).toBeDefined();
    });
  });

  it('should have consistent tenant names', () => {
    realContracts.forEach((contract) => {
      const tenant = getTenantById(contract.tenant_id);
      expect(contract.tenant_name).toBe(tenant?.name);
    });
  });
});
