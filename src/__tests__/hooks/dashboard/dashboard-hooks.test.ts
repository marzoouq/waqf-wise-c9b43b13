/**
 * Dashboard Hooks Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Dashboard Hooks', () => {
  it('should import useNazerSystemOverview', async () => {
    const { useNazerSystemOverview } = await import('@/hooks/dashboard/useNazerSystemOverview');
    expect(useNazerSystemOverview).toBeDefined();
    expect(typeof useNazerSystemOverview).toBe('function');
  });

  it('should import useRecentJournalEntries', async () => {
    const { useRecentJournalEntries } = await import('@/hooks/dashboard/useRecentJournalEntries');
    expect(useRecentJournalEntries).toBeDefined();
    expect(typeof useRecentJournalEntries).toBe('function');
  });

  it('should import useVouchersStats', async () => {
    const { useVouchersStats } = await import('@/hooks/dashboard/useVouchersStats');
    expect(useVouchersStats).toBeDefined();
    expect(typeof useVouchersStats).toBe('function');
  });
});
