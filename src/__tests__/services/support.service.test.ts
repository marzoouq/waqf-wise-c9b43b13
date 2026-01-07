/**
 * Support Service Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Support Service', () => {
  it('should import support service', async () => {
    const module = await import('@/services/support.service');
    expect(module).toBeDefined();
  });

  it('should have SupportService class', async () => {
    const { SupportService } = await import('@/services/support.service');
    expect(SupportService).toBeDefined();
  });

  it('should have getTickets method', async () => {
    const { SupportService } = await import('@/services/support.service');
    expect(typeof SupportService.getTickets).toBe('function');
  });
});
