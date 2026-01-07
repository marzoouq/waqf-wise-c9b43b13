/**
 * Security Hooks Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Security Hooks', () => {
  it('should import useSecurityDashboardData', async () => {
    const { useSecurityDashboardData } = await import('@/hooks/security');
    expect(useSecurityDashboardData).toBeDefined();
    expect(typeof useSecurityDashboardData).toBe('function');
  });
});
