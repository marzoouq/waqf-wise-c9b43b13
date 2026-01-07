/**
 * Dashboard Service Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Dashboard Service', () => {
  it('should import dashboard service', async () => {
    const module = await import('@/services/dashboard.service');
    expect(module).toBeDefined();
  });

  it('should have DashboardService class', async () => {
    const { DashboardService } = await import('@/services/dashboard.service');
    expect(DashboardService).toBeDefined();
  });

  it('should have getSystemOverview method', async () => {
    const { DashboardService } = await import('@/services/dashboard.service');
    expect(typeof DashboardService.getSystemOverview).toBe('function');
  });
});
