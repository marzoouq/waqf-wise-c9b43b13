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
  disbursed_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  beneficiaries?: {
    full_name: string;
    national_id: string;
    phone: string;
  };
}
