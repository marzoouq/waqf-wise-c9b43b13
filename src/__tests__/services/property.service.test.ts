/**
 * اختبارات خدمة العقارات
 */

import { describe, it, expect } from 'vitest';

describe('Property Service', () => {
  it('property service module should be importable', async () => {
    const module = await import('@/services/property.service');
    expect(module).toBeDefined();
  });

  it('should have PropertyService class', async () => {
    const { PropertyService } = await import('@/services/property.service');
    expect(PropertyService).toBeDefined();
  });

  it('should have getAll method', async () => {
    const { PropertyService } = await import('@/services/property.service');
    expect(typeof PropertyService.getAll).toBe('function');
  });

  it('should have getById method', async () => {
    const { PropertyService } = await import('@/services/property.service');
    expect(typeof PropertyService.getById).toBe('function');
  });

  it('should have create method', async () => {
    const { PropertyService } = await import('@/services/property.service');
    expect(typeof PropertyService.create).toBe('function');
  });

  it('should have update method', async () => {
    const { PropertyService } = await import('@/services/property.service');
    expect(typeof PropertyService.update).toBe('function');
  });

  it('should have getUnits method', async () => {
    const { PropertyService } = await import('@/services/property.service');
    expect(typeof PropertyService.getUnits).toBe('function');
  });

  it('should have getStats method', async () => {
    const { PropertyService } = await import('@/services/property.service');
    expect(typeof PropertyService.getStats).toBe('function');
  });
});
