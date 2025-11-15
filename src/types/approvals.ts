/**
 * أنواع موحدة لنظام الموافقات
 */

import { Database } from '@/integrations/supabase/types';
import { BeneficiaryRow, JournalEntryRow } from './supabase-helpers';

type Tables = Database['public']['Tables'];

// أنواع الموافقات الأساسية
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'معلق' | 'موافق' | 'مرفوض';

export interface BaseApproval {
  id: string;
  status: ApprovalStatus;
  notes: string | null;
  approver_name: string;
  level: number;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

// موافقات القروض
export type LoanRow = Tables['loans']['Row'];

export interface LoanApprovalRow {
  id: string;
  loan_id: string;
  level: number;
  status: ApprovalStatus;
  approver_name: string;
  approver_id: string | null;
  notes: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface LoanWithApprovals extends LoanRow {
  beneficiaries: BeneficiaryRow;
  loan_approvals: LoanApprovalRow[];
}

export interface LoanForApproval {
  id: string;
  loan_number: string;
  loan_amount: number;
  purpose: string;
  term_months: number;
  status: string;
  beneficiary_id: string;
  beneficiaries: {
    full_name: string;
    national_id: string;
  };
  loan_approvals: Array<{
    id: string;
    level: number;
    status: ApprovalStatus;
    approver_name: string;
    notes: string | null;
    created_at: string;
  }>;
}

// موافقات المدفوعات
export type PaymentRow = Tables['payments']['Row'];
export type PaymentApprovalRow = {
  id: string;
  payment_id: string;
  level: number;
  status: ApprovalStatus;
  approver_name: string;
  notes: string | null;
  approved_at: string | null;
  created_at: string;
};

export interface PaymentWithApprovals extends PaymentRow {
  beneficiaries: BeneficiaryRow;
  payment_approvals: PaymentApprovalRow[];
}

export interface PaymentForApproval {
  id: string;
  payment_number: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  description: string;
  status: string;
  beneficiary_id: string;
  beneficiaries: {
    full_name: string;
    national_id: string;
  };
  payment_approvals?: PaymentApprovalRow[];
}

// موافقات التوزيعات
export type DistributionRow = Tables['distributions']['Row'];
export type DistributionApprovalRow = Tables['distribution_approvals']['Row'];

export interface DistributionWithApprovals extends DistributionRow {
  distribution_approvals: DistributionApprovalRow[];
}

export interface DistributionForApproval {
  id: string;
  month: string;
  distribution_date: string;
  total_amount: number;
  beneficiaries_count: number;
  status: string;
  distribution_approvals: Array<{
    id: string;
    level: number;
    status: ApprovalStatus;
    approver_name: string;
    notes: string | null;
  }>;
}

// موافقات القيود المحاسبية
export type JournalApprovalRow = Tables['approvals']['Row'];

export interface JournalEntryWithApproval extends JournalEntryRow {
  approvals: JournalApprovalRow[];
}

export interface JournalForApproval {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  total_debit: number;
  total_credit: number;
  status: string;
  approvals: Array<{
    id: string;
    status: ApprovalStatus;
    approver_name: string;
    notes: string | null;
  }>;
}

// موافقات الطلبات
export type RequestRow = Tables['beneficiary_requests']['Row'];

export interface RequestWithBeneficiary extends RequestRow {
  beneficiaries: BeneficiaryRow;
  request_types: {
    name: string;
    name_ar: string;
  };
}

export interface RequestForApproval {
  id: string;
  request_number: string | null;
  description: string;
  amount: number | null;
  status: string | null;
  priority: string | null;
  beneficiary_id: string;
  beneficiaries: {
    full_name: string;
    national_id: string;
  };
  request_types: {
    name_ar: string;
  };
}

// أنواع مساعدة للموافقات
export interface ApprovalProgress {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  percentage: number;
}

export interface ApprovalAction {
  type: 'approve' | 'reject';
  notes?: string;
  level: number;
}

export interface ApprovalDialogProps<T> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: T;
  action: 'approve' | 'reject';
}

// Badge Configuration
export interface StatusBadgeConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: React.ComponentType<{ className?: string }>;
}

export type StatusConfigMap = Record<string, StatusBadgeConfig>;

// دالة مساعدة لحساب التقدم
export function calculateProgress(approvals: BaseApproval[]): ApprovalProgress {
  const total = approvals.length;
  const approved = approvals.filter(a => 
    a.status === 'approved' || a.status === 'موافق'
  ).length;
  const pending = approvals.filter(a => 
    a.status === 'pending' || a.status === 'معلق'
  ).length;
  const rejected = approvals.filter(a => 
    a.status === 'rejected' || a.status === 'مرفوض'
  ).length;
  
  const percentage = total > 0 ? (approved / total) * 100 : 0;

  return {
    total,
    approved,
    pending,
    rejected,
    percentage,
  };
}

// دالة للحصول على الموافقة المعلقة التالية
export function getNextPendingApproval<T extends { status: ApprovalStatus; level: number }>(
  approvals: T[]
): T | undefined {
  return approvals
    .filter(a => a.status === 'معلق' || a.status === 'pending')
    .sort((a, b) => a.level - b.level)[0];
}

// دالة للتحقق من اكتمال الموافقات
export function areAllApprovalsCompleted(approvals: BaseApproval[]): boolean {
  return approvals.every(a => 
    a.status === 'approved' || 
    a.status === 'موافق' || 
    a.status === 'rejected' || 
    a.status === 'مرفوض'
  );
}

// أنواع إضافية للمكونات
export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface JournalApproval {
  id: string;
  journal_entry_id: string;
  approver_name: string;
  status: string;
  notes: string | null;
  created_at: string;
  approved_at: string | null;
  journal_entry?: {
    id: string;
    entry_number: string;
    entry_date: string;
    description: string;
    status: string;
    posted_at?: string | null;
  };
}

export interface JournalEntryWithLines {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  status: string;
  posted_at: string | null;
  journal_entry_lines?: {
    id: string;
    account: {
      code: string;
      name_ar: string;
    };
    debit_amount: number;
    credit_amount: number;
    description: string;
  }[];
}
