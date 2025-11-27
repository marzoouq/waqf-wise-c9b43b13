/**
 * أنواع سندات الصرف والقبض
 */

export interface VoucherInsertData {
  voucher_type: string;
  voucher_number?: string;
  amount: number;
  description: string;
  status: string;
  beneficiary_id?: string;
  payment_method?: string;
  notes?: string;
  distribution_id?: string;
  bank_account_id?: string;
  created_by?: string;
}

export interface PaymentVoucher {
  id: string;
  voucher_number: string;
  voucher_type: string;
  amount: number;
  description: string;
  status: string;
  beneficiary_id?: string | null;
  payment_method?: string | null;
  notes?: string | null;
  distribution_id?: string | null;
  bank_account_id?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}
