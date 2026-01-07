/**
 * Loan Service Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Loan Service', () => {
  it('should import loans service', async () => {
    const module = await import('@/services/loans.service');
    expect(module).toBeDefined();
  });

  it('should have LoansService class', async () => {
    const { LoansService } = await import('@/services/loans.service');
    expect(LoansService).toBeDefined();
  });

  it('should have getStats method', async () => {
    const { LoansService } = await import('@/services/loans.service');
    expect(typeof LoansService.getStats).toBe('function');
  });
});
