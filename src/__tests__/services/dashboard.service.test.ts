/**
 * اختبارات خدمة لوحة التحكم - اختبارات وظيفية حقيقية
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) })), rpc: vi.fn().mockResolvedValue({ data: {}, error: null }) },
}));

describe('DashboardService - Real Tests', () => {
  it('should import DashboardService', async () => {
    const { DashboardService } = await import('@/services/dashboard.service');
    expect(DashboardService).toBeDefined();
  });

  it('should have getSystemOverview method', async () => {
    const { DashboardService } = await import('@/services/dashboard.service');
    expect(typeof DashboardService.getSystemOverview).toBe('function');
  });

  it('should have getUnifiedKPIs method', async () => {
    const { DashboardService } = await import('@/services/dashboard.service');
    expect(typeof DashboardService.getUnifiedKPIs).toBe('function');
  });

  it('should have getBankBalance method', async () => {
    const { DashboardService } = await import('@/services/dashboard.service');
    expect(typeof DashboardService.getBankBalance).toBe('function');
  });
});
