export interface LoanType {
  id: string;
  name_ar: string;
  name_en?: string;
  description?: string;
  max_amount?: number;
  min_amount: number;
  interest_rate: number;
  max_term_months: number;
  grace_period_months: number;
  requires_guarantor: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoanSchedule {
  id: string;
  loan_id: string;
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  paid_amount: number;
  payment_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  schedule_id?: string;
  payment_amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  journal_entry_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface EmergencyAid {
  id: string;
  beneficiary_id: string;
  request_id?: string;
  aid_type: string;
  amount: number;
  reason: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  requested_date: string;
  approved_date?: string;
  approved_by?: string;
  disbursed_date?: string;
  disbursed_by?: string;
  payment_voucher_id?: string;
  notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  beneficiaries?: {
    full_name: string;
    national_id: string;
    phone: string;
  };
}
