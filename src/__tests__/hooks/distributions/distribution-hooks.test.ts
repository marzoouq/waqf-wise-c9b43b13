/**
 * Distribution Hooks Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Distribution Hooks', () => {
  it('should import useDistributionDetails', async () => {
    const { useDistributionDetails } = await import('@/hooks/distributions/useDistributionDetails');
    expect(useDistributionDetails).toBeDefined();
    expect(typeof useDistributionDetails).toBe('function');
  });

  it('should import distributions hooks index', async () => {
    const module = await import('@/hooks/distributions');
    expect(module).toBeDefined();
  });
});
