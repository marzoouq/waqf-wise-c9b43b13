/**
 * اختبارات خدمة المستفيدين
 */

import { describe, it, expect } from 'vitest';

describe('Beneficiary Service', () => {
  it('beneficiary service module should be importable', async () => {
    const module = await import('@/services/beneficiary.service');
    expect(module).toBeDefined();
  });

  it('should have BeneficiaryService class', async () => {
    const { BeneficiaryService } = await import('@/services/beneficiary.service');
    expect(BeneficiaryService).toBeDefined();
  });

  it('should have getAll method', async () => {
    const { BeneficiaryService } = await import('@/services/beneficiary.service');
    expect(typeof BeneficiaryService.getAll).toBe('function');
  });

  it('should have getById method', async () => {
    const { BeneficiaryService } = await import('@/services/beneficiary.service');
    expect(typeof BeneficiaryService.getById).toBe('function');
  });

  it('should have create method', async () => {
    const { BeneficiaryService } = await import('@/services/beneficiary.service');
    expect(typeof BeneficiaryService.create).toBe('function');
  });

  it('should have update method', async () => {
    const { BeneficiaryService } = await import('@/services/beneficiary.service');
    expect(typeof BeneficiaryService.update).toBe('function');
  });

  it('should have delete method', async () => {
    const { BeneficiaryService } = await import('@/services/beneficiary.service');
    expect(typeof BeneficiaryService.delete).toBe('function');
  });

  it('should have getStats method', async () => {
    const { BeneficiaryService } = await import('@/services/beneficiary.service');
    expect(typeof BeneficiaryService.getStats).toBe('function');
  });
});
