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
