/**
 * اختبارات Hooks المراقبة - مبسطة
 */

import { describe, it, expect } from 'vitest';

describe('Monitoring Hooks', () => {
  it('useDatabaseHealth should be importable', async () => {
    const module = await import('@/hooks/monitoring/useDatabaseHealth');
    expect(module.useDatabaseHealth).toBeDefined();
  });

  it('useDatabasePerformance should be importable', async () => {
    const module = await import('@/hooks/monitoring/useDatabasePerformance');
    expect(module.useDatabasePerformance).toBeDefined();
  });

  it('useIgnoredAlerts should be importable', async () => {
    const module = await import('@/hooks/monitoring');
    expect(module.useIgnoredAlerts).toBeDefined();
  });

  it('useLivePerformance should be importable', async () => {
    const module = await import('@/hooks/monitoring/useLivePerformance');
    expect(module.useLivePerformance).toBeDefined();
  });
});
