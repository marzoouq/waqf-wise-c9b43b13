import { Database } from '@/integrations/supabase/types';

type Payment = Database['public']['Tables']['payments']['Row'];

export const mockPayment = (overrides?: Partial<Payment>): Payment => ({
  id: 'test-payment-001',
  payment_number: 'PAY-001',
  payment_type: 'voucher',
  amount: 5000,
  payment_date: '2025-01-15',
  beneficiary_id: null,
  payer_name: 'مستفيد اختبار',
  payment_method: 'cash',
  reference_number: 'PAY-001',
  description: 'صرف مستحقات شهرية',
  status: 'completed',
  journal_entry_id: null,
  rental_payment_id: null,
  contract_id: null,
  created_at: '2025-01-15T00:00:00.000Z',
  updated_at: '2025-01-15T00:00:00.000Z',
  notes: null,
  ...overrides,
});

export const mockPayments = (count: number = 5): Payment[] => {
  return Array.from({ length: count }, (_, i) => 
    mockPayment({ 
      id: `test-payment-${String(i + 1).padStart(3, '0')}`,
      amount: 5000 * (i + 1),
      reference_number: `PAY-${String(i + 1).padStart(3, '0')}`,
      payer_name: `مستفيد ${i + 1}`,
    })
  );
};

export const mockReceipt = (overrides?: Partial<Payment>): Payment => 
  mockPayment({
    payment_type: 'receipt',
    payer_name: 'دافع اختبار',
    description: 'تبرع',
    ...overrides,
  });

export const mockVoucher = (overrides?: Partial<Payment>): Payment => 
  mockPayment({
    payment_type: 'voucher',
    description: 'صرف مستحقات',
    ...overrides,
  });
