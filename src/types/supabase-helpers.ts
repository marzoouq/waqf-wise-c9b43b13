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
export type PaymentApprovalRow = Tables['payment_approvals']['Row'];

export type PaymentWithBeneficiary = PaymentRow & {
  beneficiaries: BeneficiaryRow;
};

export type PaymentWithApprovals = PaymentRow & {
  beneficiaries: BeneficiaryRow;
  payment_approvals: PaymentApprovalRow[];
};

// الطلبات (Requests)
export type RequestRow = Tables['beneficiary_requests']['Row'];
export type RequestTypeRow = Tables['request_types']['Row'];
export type RequestApprovalRow = Tables['request_approvals']['Row'];

export type RequestWithBeneficiary = RequestRow & {
  beneficiaries: BeneficiaryRow;
  request_types?: RequestTypeRow;
};

export type RequestWithApprovals = RequestRow & {
  beneficiaries: BeneficiaryRow;
  request_types?: RequestTypeRow;
  request_approvals: RequestApprovalRow[];
};

// القروض مع الموافقات
export type LoanApprovalRow = Tables['loan_approvals']['Row'];

export type LoanWithApprovals = LoanRow & {
  beneficiaries: BeneficiaryRow;
  loan_approvals: LoanApprovalRow[];
};

// العائلات
export type FamilyRow = Tables['families']['Row'];
export type FamilyMemberRow = Tables['family_members']['Row'];

export type FamilyWithMembers = FamilyRow & {
  family_members: (FamilyMemberRow & {
    beneficiaries: BeneficiaryRow;
  })[];
};

export type FamilyWithHead = FamilyRow & {
  head_of_family?: BeneficiaryRow;
};

// القبائل
export type TribeRow = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

// الحسابات البنكية والتسويات
export type BankAccountRow = Tables['bank_accounts']['Row'];
export type BankStatementRow = Tables['bank_statements']['Row'];
export type BankTransactionRow = Tables['bank_transactions']['Row'];

export type BankStatementWithTransactions = BankStatementRow & {
  bank_transactions: BankTransactionRow[];
};

export type BankTransactionWithStatement = BankTransactionRow & {
  bank_statements: BankStatementRow;
};

// التدفقات النقدية
export type CashFlowRow = Tables['cash_flows']['Row'];

export type CashFlowWithFiscalYear = CashFlowRow & {
  fiscal_years: Tables['fiscal_years']['Row'];
};

// الرسائل الداخلية
export type InternalMessageRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

// إعدادات النظام
export type SystemSettingRow = {
  id: string;
  key: string;
  value: string;
  description?: string;
  updated_at: string;
};

// الفواتير
export type InvoiceRow = Tables['invoices']['Row'];

export type InvoiceWithLines = InvoiceRow & {
  invoice_lines: Tables['invoice_lines']['Row'][];
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
