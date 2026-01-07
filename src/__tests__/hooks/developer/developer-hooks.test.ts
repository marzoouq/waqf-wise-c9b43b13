/**
 * Developer Hooks Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Developer Hooks', () => {
  it('should import useErrorNotifications', async () => {
    const { useErrorNotifications } = await import('@/hooks/developer');
    expect(useErrorNotifications).toBeDefined();
    expect(typeof useErrorNotifications).toBe('function');
  });

  it('should import useDeveloperDashboardData', async () => {
    const { useDeveloperDashboardData } = await import('@/hooks/developer');
    expect(useDeveloperDashboardData).toBeDefined();
    expect(typeof useDeveloperDashboardData).toBe('function');
  });
});
