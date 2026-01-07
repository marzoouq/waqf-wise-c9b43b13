/**
 * Support Hooks Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Support Hooks', () => {
  it('should import useSupportTickets', async () => {
    const { useSupportTickets } = await import('@/hooks/support');
    expect(useSupportTickets).toBeDefined();
    expect(typeof useSupportTickets).toBe('function');
  });

  it('should import useSupportStats', async () => {
    const { useSupportStats } = await import('@/hooks/support');
    expect(useSupportStats).toBeDefined();
    expect(typeof useSupportStats).toBe('function');
  });

  it('should import useTicketComments', async () => {
    const { useTicketComments } = await import('@/hooks/support');
    expect(useTicketComments).toBeDefined();
    expect(typeof useTicketComments).toBe('function');
  });

  it('should import useAgentAvailability', async () => {
    const { useAgentAvailability } = await import('@/hooks/support');
    expect(useAgentAvailability).toBeDefined();
    expect(typeof useAgentAvailability).toBe('function');
  });
});
