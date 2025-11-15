/**
 * أنواع مساعدة لـ Supabase مع العلاقات
 * يساعد في تقليل استخدام any وتحسين Type Safety
 */

import { Database } from '@/integrations/supabase/types';

// استخراج الأنواع من Database
type Tables = Database['public']['Tables'];

// المستفيدون مع العلاقات
export type BeneficiaryRow = Tables['beneficiaries']['Row'];
export type BeneficiaryInsert = Tables['beneficiaries']['Insert'];
export type BeneficiaryUpdate = Tables['beneficiaries']['Update'];

export type BeneficiaryWithFamily = BeneficiaryRow & {
  family?: Tables['families']['Row'];
};

export type BeneficiaryWithAttachments = BeneficiaryRow & {
  beneficiary_attachments?: Tables['beneficiary_attachments']['Row'][];
};

export type BeneficiaryFull = BeneficiaryRow & {
  family?: Tables['families']['Row'];
  beneficiary_attachments?: Tables['beneficiary_attachments']['Row'][];
  beneficiary_activity_log?: Tables['beneficiary_activity_log']['Row'][];
};

// القيود المحاسبية مع التفاصيل
export type JournalEntryRow = Tables['journal_entries']['Row'];
export type JournalEntryLineRow = Tables['journal_entry_lines']['Row'];
export type AccountRow = Tables['accounts']['Row'];

export type JournalEntryWithLines = JournalEntryRow & {
  journal_entry_lines: (JournalEntryLineRow & {
    accounts: AccountRow;
  })[];
};

export type JournalEntryWithApproval = JournalEntryRow & {
  approvals?: Tables['approvals']['Row'][];
};

export type JournalEntryFull = JournalEntryRow & {
  journal_entry_lines: (JournalEntryLineRow & {
    accounts: AccountRow;
  })[];
  approvals?: Tables['approvals']['Row'][];
};

// القروض مع التفاصيل
export type LoanRow = Tables['loans']['Row'];
export type LoanInstallmentRow = Tables['loan_installments']['Row'];

export type LoanWithBeneficiary = LoanRow & {
  beneficiaries: BeneficiaryRow;
};

export type LoanWithInstallments = LoanRow & {
  loan_installments: LoanInstallmentRow[];
};

export type LoanFull = LoanRow & {
  beneficiaries: BeneficiaryRow;
  loan_installments: LoanInstallmentRow[];
};

// العقارات مع العقود
export type PropertyRow = Tables['properties']['Row'];
export type ContractRow = Tables['contracts']['Row'];

export type PropertyWithContracts = PropertyRow & {
  contracts: ContractRow[];
};

export type ContractWithProperty = ContractRow & {
  properties: PropertyRow;
};

// التوزيعات مع التفاصيل
export type DistributionRow = Tables['distributions']['Row'];
export type DistributionApprovalRow = Tables['distribution_approvals']['Row'];

export type DistributionWithApprovals = DistributionRow & {
  distribution_approvals: DistributionApprovalRow[];
};

export type DistributionWithJournal = DistributionRow & {
  journal_entries?: JournalEntryRow;
};

// المدفوعات
export type PaymentRow = Tables['payments']['Row'];

export type PaymentWithBeneficiary = PaymentRow & {
  beneficiaries: BeneficiaryRow;
};

// الفواتير
export type InvoiceRow = Tables['invoices']['Row'];

// الحسابات البنكية
export type BankAccountRow = Tables['bank_accounts']['Row'];

export type BankAccountWithAccount = BankAccountRow & {
  accounts?: AccountRow;
};

// التقارير المخصصة
export type CustomReportRow = Tables['custom_report_templates']['Row'];

export interface ReportConfiguration {
  filters?: Record<string, unknown>;
  columns?: string[];
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateRange?: {
    start: string;
    end: string;
  };
}

export type CustomReportWithConfig = CustomReportRow & {
  configuration: ReportConfiguration;
};

// أنواع للموافقات
export interface ApprovalAction {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  approver_name: string;
  level: number;
}

export interface ApprovalWorkflow {
  entity_id: string;
  entity_type: 'loan' | 'distribution' | 'payment' | 'journal_entry';
  approvals: ApprovalAction[];
  current_level: number;
  is_completed: boolean;
}

// أنواع للإحصائيات
export interface DashboardStats {
  total_beneficiaries: number;
  total_families: number;
  pending_requests: number;
  total_distributions: number;
  monthly_revenue: number;
  monthly_expenses: number;
}

export interface FinancialStats {
  total_revenue: number;
  total_expenses: number;
  net_income: number;
  cash_balance: number;
  pending_payments: number;
  overdue_receivables: number;
}

// أنواع للطلبات
export type RequestRow = Tables['beneficiary_requests']['Row'];
export type RequestTypeRow = Tables['request_types']['Row'];

export type RequestWithType = RequestRow & {
  request_types: RequestTypeRow;
};

export type RequestWithBeneficiary = RequestRow & {
  beneficiaries: BeneficiaryRow;
  request_types: RequestTypeRow;
};

// أنواع مساعدة للفورمات
export interface FormError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: FormError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// أنواع للتصدير
export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
}

// Bank statements and transactions
export type BankStatementRow = Tables['bank_statements']['Row'];
export type BankTransactionRow = Tables['bank_transactions']['Row'];

// Accounting specific types
export interface AccountWithBalance extends AccountRow {
  balance?: number;
  children?: AccountWithBalance[];
  allows_transactions?: boolean;
  is_system_account?: boolean;
}

export interface TrialBalanceRow {
  account_id: string;
  code: string;
  name: string;
  account_type: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface GeneralLedgerEntry {
  id: string;
  entry_date: string;
  entry_number: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
  journal_entry?: {
    id?: string;
    entry_number: string;
    entry_date: string;
    description: string;
  };
}

export interface BankReconciliationItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  matched: boolean;
  reference?: string;
}
