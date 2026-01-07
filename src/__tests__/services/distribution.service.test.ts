/**
 * Distribution Service Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Distribution Service', () => {
  it('should import DistributionService', async () => {
    const module = await import('@/services/distribution.service');
    expect(module).toBeDefined();
  });

  it('should have getHeirDistributions method', async () => {
    const { DistributionService } = await import('@/services/distribution.service');
    expect(DistributionService).toBeDefined();
    expect(typeof DistributionService.getHeirDistributions).toBe('function');
  });

  it('should have simulate method', async () => {
    const { DistributionService } = await import('@/services/distribution.service');
    expect(typeof DistributionService.simulate).toBe('function');
  });
});
