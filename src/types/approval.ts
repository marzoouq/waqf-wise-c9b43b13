/**
 * أنواع نظام الموافقات
 */

export interface DistributionApprovalInsert {
  distribution_id: string;
  approver_id: string;
  approver_name: string;
  level: number;
  status: 'موافق' | 'مرفوض';
  notes?: string;
  approved_at: string;
}

export interface LoanApprovalInsert {
  loan_id: string;
  approver_id: string;
  approver_name: string;
  level: number;
  status: 'موافق' | 'مرفوض';
  notes?: string;
  approved_at: string;
}

export interface PaymentApprovalInsert {
  payment_id: string;
  approver_id: string;
  approver_name: string;
  level: number;
  status: 'موافق' | 'مرفوض';
  notes?: string;
  approved_at: string;
}
