/**
 * أنواع العمليات البنكية والتسوية
 */

// أنواع إدخال كشوف الحساب
export interface BankStatementInsert {
  bank_account_id: string;
  statement_date: string;
  opening_balance: number;
  closing_balance: number;
  total_debits?: number;
  total_credits?: number;
  status?: string; // قبول أي string
}

export interface BankStatementUpdate {
  opening_balance?: number;
  closing_balance?: number;
  total_debits?: number;
  total_credits?: number;
  status?: 'draft' | 'posted' | 'reconciled';
  reconciled_at?: string;
  reconciled_by?: string;
}

// أنواع الحركات البنكية
export type TransactionType = 'debit' | 'credit' | 'deposit' | 'withdrawal' | 'transfer';

export interface BankTransactionInsert {
  statement_id: string;
  transaction_date: string;
  description: string;
  amount: number;
  transaction_type: string; // قبول أي string
  reference_number?: string;
  is_matched?: boolean;
}

export interface BankTransactionUpdate {
  description?: string;
  amount?: number;
  is_matched?: boolean;
  journal_entry_id?: string;
}

// أنواع مطابقة الحركات
export interface BankTransactionMatch {
  transaction_id: string;
  journal_entry_id: string;
  matched_by?: string;
  matched_at?: string;
}

// أنواع التسوية البنكية
export interface ReconciliationData {
  statement_id: string;
  matched_transactions: BankTransactionMatch[];
  reconciled_by: string;
  reconciled_at?: string;
  notes?: string;
}

export interface ReconciliationResult {
  statement_id: string;
  total_matched: number;
  total_unmatched: number;
  difference_amount: number;
  is_balanced: boolean;
}

// أنواع الحسابات البنكية
export interface BankAccountInsert {
  account_id?: string;
  bank_name: string;
  account_number: string;
  iban?: string;
  swift_code?: string;
  currency?: string;
  current_balance?: number;
  is_active?: boolean;
}

export interface BankAccountUpdate {
  bank_name?: string;
  account_number?: string;
  iban?: string;
  swift_code?: string;
  current_balance?: number;
  is_active?: boolean;
}
