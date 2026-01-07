/**
 * Tenant Service Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Tenant Service', () => {
  it('should import tenant service', async () => {
    const module = await import('@/services/tenant.service');
    expect(module).toBeDefined();
  });

  it('should have TenantService class', async () => {
    const { TenantService } = await import('@/services/tenant.service');
    expect(TenantService).toBeDefined();
  });

  it('should have getStats method', async () => {
    const { TenantService } = await import('@/services/tenant.service');
    expect(typeof TenantService.getStats).toBe('function');
  });
});
