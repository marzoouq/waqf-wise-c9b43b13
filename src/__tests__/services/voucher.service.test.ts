/**
 * Voucher Service Tests
 * @version 1.0.0
 */
import { describe, it, expect } from 'vitest';

describe('Voucher Service', () => {
  it('should import payment service for vouchers', async () => {
    const module = await import('@/services/payment.service');
    expect(module).toBeDefined();
  });

  it('should have PaymentService class', async () => {
    const { PaymentService } = await import('@/services/payment.service');
    expect(PaymentService).toBeDefined();
  });

  it('should have getVouchersStats method', async () => {
    const { PaymentService } = await import('@/services/payment.service');
    expect(typeof PaymentService.getVouchersStats).toBe('function');
  });
});
