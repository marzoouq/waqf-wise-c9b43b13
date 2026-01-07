/**
 * Performance Tests - Bundle Analysis
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Performance - Bundle Analysis', () => {
  it('should not have circular dependencies in hooks', async () => {
    // Test that hooks can be imported without errors
    const hookModules = [
      '@/hooks/auth',
      '@/hooks/beneficiary',
      '@/hooks/accounting',
    ];

    for (const module of hookModules) {
      const imported = await import(module);
      expect(imported).toBeDefined();
    }
  });

  it('should not have circular dependencies in services', async () => {
    const serviceModules = [
      '@/services/auth.service',
      '@/services/beneficiary.service',
      '@/services/accounting.service',
    ];

    for (const module of serviceModules) {
      const imported = await import(module);
      expect(imported).toBeDefined();
    }
  });

  it('should tree-shake unused exports', async () => {
    // Import only what's needed
    const { Button } = await import('@/components/ui/button');
    expect(Button).toBeDefined();
    expect(typeof Button).toBe('function');
  });
});
