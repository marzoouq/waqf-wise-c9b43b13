/**
 * أنواع القيود المحاسبية
 */

export interface JournalEntryLine {
  id?: string;
  account_id: string;
  account_code?: string;
  account_name?: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface AccountMapping {
  account_id: string;
  percentage?: number;
  fixed_amount?: number;
}

export interface AutoJournalAccount {
  account_id: string;
  percentage?: number;
  amount_formula?: string;
}

export interface AutoJournalTemplate {
  id: string;
  template_name: string;
  trigger_event: string;
  description?: string;
  debit_accounts: AutoJournalAccount[];
  credit_accounts: AutoJournalAccount[];
  is_active: boolean;
  priority?: number;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

export interface JournalEntryMetadata {
  source?: string;
  reference_type?: string;
  reference_id?: string;
  auto_generated?: boolean;
  template_id?: string;
  [key: string]: unknown;
}

export interface TrialBalanceItem {
  account_id: string;
  account_code: string;
  account_name: string;
  total_debit: number;
  total_credit: number;
  balance: number;
  account_type: string;
}
