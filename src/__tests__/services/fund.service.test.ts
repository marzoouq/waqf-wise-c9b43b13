/**
 * Fund Service Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Fund Service', () => {
  it('should import fund service', async () => {
    const module = await import('@/services/fund.service');
    expect(module).toBeDefined();
  });

  it('should have FundService class', async () => {
    const { FundService } = await import('@/services/fund.service');
    expect(FundService).toBeDefined();
  });

  it('should have getDistributionDetails method', async () => {
    const { FundService } = await import('@/services/fund.service');
    expect(typeof FundService.getDistributionDetails).toBe('function');
  });
});
