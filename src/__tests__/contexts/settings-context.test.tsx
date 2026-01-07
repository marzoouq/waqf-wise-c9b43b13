/**
 * SettingsContext Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('SettingsContext', () => {
  it('should import SettingsContext', async () => {
    const module = await import('@/contexts/SettingsContext');
    expect(module).toBeDefined();
  });

  it('should export SettingsProvider', async () => {
    const { SettingsProvider } = await import('@/contexts/SettingsContext');
    expect(SettingsProvider).toBeDefined();
  });

  it('should export useSettings hook', async () => {
    const { useSettings } = await import('@/contexts/SettingsContext');
    expect(useSettings).toBeDefined();
    expect(typeof useSettings).toBe('function');
  });
});
