/**
 * اختبارات Hooks المستفيدين - مبسطة
 */

import { describe, it, expect } from 'vitest';

describe('Beneficiary Hooks', () => {
  it('useBeneficiaries should be importable', async () => {
    const module = await import('@/hooks/beneficiary/useBeneficiaries');
    expect(module.useBeneficiaries).toBeDefined();
  });

  it('useBeneficiaryProfile should be importable', async () => {
    const module = await import('@/hooks/beneficiary/useBeneficiaryProfile');
    expect(module.useBeneficiaryProfile).toBeDefined();
  });

  it('useBeneficiaryAttachments should be importable', async () => {
    const module = await import('@/hooks/beneficiary/useBeneficiaryAttachments');
    expect(module.useBeneficiaryAttachments).toBeDefined();
  });

  it('useFamilies should be importable', async () => {
    const module = await import('@/hooks/beneficiary/useFamilies');
    expect(module.useFamilies).toBeDefined();
  });

  it('useTribes should be importable', async () => {
    const module = await import('@/hooks/beneficiary/useTribes');
    expect(module.useTribes).toBeDefined();
  });

  it('useEmergencyAid should be importable', async () => {
    const module = await import('@/hooks/beneficiary/useEmergencyAid');
    expect(module.useEmergencyAid).toBeDefined();
  });
});
