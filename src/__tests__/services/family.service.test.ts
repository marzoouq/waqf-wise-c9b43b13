/**
 * Family Service Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Family Service', () => {
  it('should import family service', async () => {
    const module = await import('@/services/family.service');
    expect(module).toBeDefined();
  });

  it('should have FamilyService class', async () => {
    const { FamilyService } = await import('@/services/family.service');
    expect(FamilyService).toBeDefined();
  });

  it('should have getAll method', async () => {
    const { FamilyService } = await import('@/services/family.service');
    expect(typeof FamilyService.getAll).toBe('function');
  });
});
