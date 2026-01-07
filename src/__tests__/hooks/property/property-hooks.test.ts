/**
 * اختبارات Hooks العقارات - مبسطة
 */

import { describe, it, expect } from 'vitest';

describe('Property Hooks', () => {
  it('useProperties should be importable', async () => {
    const module = await import('@/hooks/property/useProperties');
    expect(module.useProperties).toBeDefined();
  });

  it('usePropertyUnits should be importable', async () => {
    const module = await import('@/hooks/property/usePropertyUnits');
    expect(module.usePropertyUnits).toBeDefined();
  });

  it('useTenants should be importable', async () => {
    const module = await import('@/hooks/property/useTenants');
    expect(module.useTenants).toBeDefined();
  });

  it('useContracts should be importable', async () => {
    const module = await import('@/hooks/property/useContracts');
    expect(module.useContracts).toBeDefined();
  });

  it('useMaintenanceRequests should be importable', async () => {
    const module = await import('@/hooks/property/useMaintenanceRequests');
    expect(module.useMaintenanceRequests).toBeDefined();
  });

  it('useRentalPayments should be importable', async () => {
    const module = await import('@/hooks/property/useRentalPayments');
    expect(module.useRentalPayments).toBeDefined();
  });
});
