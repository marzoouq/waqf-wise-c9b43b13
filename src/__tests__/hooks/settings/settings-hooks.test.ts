/**
 * Settings Hooks Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Settings Hooks', () => {
  it('should import useTwoFactorAuth', async () => {
    const { useTwoFactorAuth } = await import('@/hooks/settings');
    expect(useTwoFactorAuth).toBeDefined();
    expect(typeof useTwoFactorAuth).toBe('function');
  });

  it('should import useSettingsCategories', async () => {
    const { useSettingsCategories } = await import('@/hooks/settings');
    expect(useSettingsCategories).toBeDefined();
    expect(typeof useSettingsCategories).toBe('function');
  });
});
