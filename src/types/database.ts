// أنواع مبسطة لقاعدة البيانات لتجنب Type instantiation issues

export interface BankAccount {
  id: string;
  account_id: string | null;
  bank_name: string;
  account_number: string;
  iban: string | null;
  swift_code: string | null;
  currency: string;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankStatement {
  id: string;
  bank_account_id: string;
  statement_date: string;
  opening_balance: number;
  closing_balance: number;
  status: string;
  reconciled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankTransaction {
  id: string;
  statement_id: string;
  transaction_date: string;
  transaction_type: string;
  reference_number: string | null;
  description: string;
  amount: number;
  is_matched: boolean;
  journal_entry_id: string | null;
  created_at: string;
}

export interface Family {
  id: string;
  family_name: string;
  tribe: string | null;
  head_of_family_id: string | null;
  total_members: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  beneficiary_id: string;
  relationship_to_head: string;
  is_dependent: boolean;
  priority_level: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  payment_number: string;
  payment_date: string;
  amount: number;
  description: string | null;
  beneficiary_id: string | null;
  fund_id: string | null;
  status: string;
  payment_method: string | null;
  created_at: string;
}

export interface CashFlow {
  id: string;
  fiscal_year_id: string;
  period_start: string;
  period_end: string;
  operating_activities: number;
  investing_activities: number;
  financing_activities: number;
  net_cash_flow: number;
  opening_cash: number;
  closing_cash: number;
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  loan_number: string;
  beneficiary_id: string;
  loan_amount: number;
  monthly_payment: number;
  total_payments: number;
  remaining_amount: number;
  start_date: string;
  end_date: string;
  status: string;
  interest_rate: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoanInstallment {
  id: string;
  loan_id: string;
  installment_number: number;
  due_date: string;
  amount: number;
  paid_amount: number | null;
  remaining_amount: number | null;
  status: string;
  paid_at: string | null;
  created_at: string;
}

// Helper type for database queries
export type DatabaseQueryResult<T> = {
  data: T | null;
  error: Error | null;
};

export type DatabaseQueryArrayResult<T> = {
  data: T[] | null;
  error: Error | null;
  count?: number | null;
};
