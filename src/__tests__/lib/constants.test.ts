/**
 * Constants Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Constants', () => {
  it('should import constants', async () => {
    const module = await import('@/lib/constants');
    expect(module).toBeDefined();
  });

  it('should have QUERY_STALE_TIME', async () => {
    const { QUERY_STALE_TIME } = await import('@/lib/constants');
    expect(QUERY_STALE_TIME).toBeDefined();
  });

  it('should have proper stale time values', async () => {
    const { QUERY_STALE_TIME } = await import('@/lib/constants');
    if (QUERY_STALE_TIME.DEFAULT) {
      expect(typeof QUERY_STALE_TIME.DEFAULT).toBe('number');
    }
  });
});
