/**
 * RolesContext Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('RolesContext', () => {
  it('should import RolesContext module', async () => {
    const module = await import('@/contexts/RolesContext');
    expect(module).toBeDefined();
  });

  it('should export RolesProvider', async () => {
    const { RolesProvider } = await import('@/contexts/RolesContext');
    expect(RolesProvider).toBeDefined();
    expect(typeof RolesProvider).toBe('function');
  });

  it('should have proper exports', async () => {
    const module = await import('@/contexts/RolesContext');
    expect(Object.keys(module).length).toBeGreaterThan(0);
  });
});
