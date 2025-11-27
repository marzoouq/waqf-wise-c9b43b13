/**
 * أنواع البيانات المالية
 */

export interface FinancialKPI {
  id: string;
  kpi_name: string;
  kpi_value: number;
  kpi_target?: number;
  kpi_category?: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  description?: string;
  line_number?: number;
  created_at?: string;
  accounts?: {
    name_ar: string;
    code: string;
  };
}

export interface KPIsByName {
  [key: string]: FinancialKPI;
}

export interface KPIsByCategory {
  [key: string]: FinancialKPI[];
}
