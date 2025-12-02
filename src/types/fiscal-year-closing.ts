/**
 * أنواع إقفال السنة المالية
 * Fiscal Year Closing Types
 */

export interface FiscalYearClosing {
  id: string;
  fiscal_year_id: string;
  closing_date: string;
  closing_type: 'manual' | 'automatic';
  
  // الإيرادات
  total_revenues: number;
  rental_revenues: number;
  other_revenues: number;
  
  // المصروفات
  total_expenses: number;
  administrative_expenses: number;
  maintenance_expenses: number;
  development_expenses: number;
  other_expenses: number;
  
  // الحصص والاستقطاعات
  nazer_percentage: number;
  nazer_share: number;
  waqif_percentage: number;
  waqif_share: number;
  
  // توزيعات المستفيدين
  total_beneficiary_distributions: number;
  heirs_count: number;
  
  // الضرائب والزكاة
  total_vat_collected: number;
  total_vat_paid: number;
  net_vat: number;
  zakat_amount: number;
  
  // رقبة الوقف
  net_income: number;
  waqf_corpus: number;
  
  // الأرصدة
  opening_balance: number;
  closing_balance: number;
  
  // قيد الإقفال
  closing_journal_entry_id: string | null;
  
  // البيانات التفصيلية
  heir_distributions: HeirDistribution[] | null;
  expense_breakdown: ExpenseBreakdown | null;
  revenue_breakdown: RevenueBreakdown | null;
  
  // معلومات الإقفال
  closed_by: string | null;
  closed_by_name: string | null;
  notes: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface HeirDistribution {
  heir_id: string;
  heir_name: string;
  heir_type: string;
  share_amount: number;
  share_percentage?: number;
}

export interface ExpenseBreakdown {
  administrative: number;
  maintenance: number;
  development: number;
  other: number;
  total: number;
}

export interface RevenueBreakdown {
  rental: number;
  sales: number;
  other: number;
  total: number;
}

export interface FiscalYearSummary {
  total_revenues: number;
  total_expenses: number;
  vat_collected: number;
  beneficiary_distributions: number;
  net_income: number;
}

export interface ClosingPreview {
  fiscal_year_id: string;
  fiscal_year_name: string;
  summary: FiscalYearSummary;
  closing_entry: ClosingEntry;
  waqf_corpus: number;
  can_close: boolean;
  warnings: string[];
}

export interface ClosingEntry {
  entry_number: string;
  entry_date: string;
  description: string;
  lines: ClosingEntryLine[];
  total_debit: number;
  total_credit: number;
}

export interface ClosingEntryLine {
  account_code: string;
  account_name: string;
  debit_amount: number;
  credit_amount: number;
  description: string;
}
