/**
 * Types for Payments Module
 * أنواع وحدة سندات القبض والصرف
 */

export interface Payment {
  id: string;
  payment_number: string;
  payment_type: string;
  payment_date: string;
  payer_name: string;
  amount: number;
  description?: string | null;
  status: string;
  reference_number?: string | null;
  bank_account_id?: string | null;
  beneficiary_id?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface PaymentInsert {
  payment_number: string;
  payment_type: string;
  payment_date: string;
  payer_name: string;
  amount: number;
  description?: string;
  status?: string;
  reference_number?: string;
  bank_account_id?: string;
  beneficiary_id?: string;
}

export interface PaymentUpdate {
  payment_type?: string;
  payment_date?: string;
  payer_name?: string;
  amount?: number;
  description?: string;
  status?: string;
  reference_number?: string;
}

export type PaymentType = 'receipt' | 'disbursement';
export type PaymentStatus = 'pending' | 'completed' | 'cancelled';

// Rental Payment Types
export interface RentalPaymentInsert {
  payment_number?: string;
  contract_id: string;
  due_date: string;
  amount_due: number;
  payment_date?: string;
  amount_paid?: number;
  payment_method?: string;
  receipt_number?: string;
  late_fee?: number;
  discount?: number;
  notes?: string;
  status?: string;
}

export interface RentalPaymentUpdate {
  due_date?: string;
  amount_due?: number;
  payment_date?: string;
  amount_paid?: number;
  payment_method?: string;
  receipt_number?: string;
  late_fee?: number;
  discount?: number;
  notes?: string;
  status?: string;
}
