// أنواع المحاسبة

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";
export type AccountNature = "debit" | "credit";
export type EntryStatus = "draft" | "posted" | "cancelled";

export interface Account {
  id: string;
  code: string;
  name_ar: string;
  name_en: string | null;
  account_type: AccountType;
  account_nature: AccountNature;
  parent_id: string | null;
  is_header: boolean;
  is_active: boolean;
  current_balance?: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  status: EntryStatus;
  fiscal_year_id: string;
  reference_type: string | null;
  reference_id: string | null;
  created_by: string | null;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  line_number: number;
  description: string | null;
  debit_amount: number;
  credit_amount: number;
  created_at: string;
}

export interface FiscalYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_closed: boolean;
  is_published: boolean;
  published_at: string | null;
  published_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  account_id: string;
  fiscal_year_id: string;
  period_type: string;
  period_number: number | null;
  budgeted_amount: number;
  actual_amount: number;
  variance_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  notes: string | null;
  journal_entry_id: string | null;
  created_at: string;
  updated_at: string;
}

// استخدام النوع الموحد من invoice-line.ts
export type { InvoiceLine } from "./invoice-line";

export interface Approval {
  id: string;
  journal_entry_id: string;
  approver_name: string;
  status: string;
  notes: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

// Insert types for mutations
export interface AccountInsert {
  code: string;
  name_ar: string;
  name_en?: string;
  account_type: AccountType;
  account_nature: AccountNature;
  parent_id?: string;
  is_header: boolean;
  is_active?: boolean;
  description?: string;
}

export interface AccountUpdate {
  code?: string;
  name_ar?: string;
  name_en?: string;
  account_type?: AccountType;
  account_nature?: AccountNature;
  parent_id?: string;
  is_header?: boolean;
  is_active?: boolean;
  description?: string;
}

export interface JournalEntryInsert {
  entry_number: string;
  entry_date: string;
  fiscal_year_id: string;
  description: string;
  reference_type?: string;
  reference_id?: string;
  status?: EntryStatus;
  created_by?: string;
}

export interface JournalLineInsert {
  account_id: string;
  line_number: number;
  debit_amount: number;
  credit_amount: number;
  description?: string;
}

export interface JournalLineData {
  debit_amount: number;
  credit_amount: number;
  accounts: {
    account_type: string;
    code: string;
  };
}

// Types for financial reports
export interface TrialBalanceItem {
  code: string;
  name_ar: string;
  account_type: string;
  total_debit: number;
  total_credit: number;
  balance: number;
}

export interface AccountWithBalance {
  id: string;
  code: string;
  name_ar: string;
  account_type: string;
  account_nature: string;
  current_balance: number | null;
}

export interface SavedSearch {
  id: string;
  search_name: string;
  search_criteria: Record<string, unknown>;
  created_at: string;
}
