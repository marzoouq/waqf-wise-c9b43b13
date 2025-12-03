/**
 * ملف تصدير مركزي لجميع الأنواع
 * Central export file for all types
 * 
 * ملاحظة: بعض الأنواع تُعرّف في hooks لأنها مرتبطة بالـ query
 * - Property: من src/hooks/useProperties.ts
 * - Contract: من src/types/contracts.ts
 * - للأنواع المشتقة من DB استخدم: src/types/supabase-helpers.ts
 */

// Re-exports from specialized type files
export * from './table-rows';
export * from './accounting';
export * from './auth';
export * from './errors';
export * from './alerts';
export * from './activity';
export * from './audit';
export * from './contracts'; // Contract, ContractInsert
export * from './distributions'; // Distribution types - unified

// تجنب إعادة تصدير الأنواع المكررة من approvals
export type {
  DistributionApprovalInsert,
  LoanApprovalInsert,
  PaymentApprovalInsert,
  ApprovalStatus,
  BaseApproval,
  LoanApprovalRow,
  LoanWithApprovals,
  LoanForApproval,
  PaymentApprovalRow,
  PaymentWithApprovals,
  PaymentForApproval,
  DistributionWithApprovals,
  DistributionForApproval,
  JournalEntryWithApproval,
  JournalForApproval,
  RequestWithBeneficiary,
  RequestForApproval,
  ApprovalProgress,
  ApprovalAction,
  ApprovalDialogProps,
  StatusBadgeConfig,
  StatusConfigMap,
  LucideIcon,
  JournalApproval,
  JournalEntryWithLines,
} from './approvals';
export {
  calculateProgress,
  getNextPendingApproval,
  areAllApprovalsCompleted,
} from './approvals';
export * from './beneficiary';
export * from './loans';
export * from './admin';
export * from './reports/index';

// ============================================
// Core Entity Types - الأنواع الأساسية
// ============================================

export interface Payment {
  id: string;
  payment_type: "receipt" | "payment";
  payment_number: string;
  payment_date: string;
  amount: number;
  payment_method: "cash" | "bank_transfer" | "cheque" | "card";
  payer_name: string;
  reference_number?: string;
  description: string;
  notes?: string;
  journal_entry_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: "draft" | "sent" | "paid" | "cancelled";
  notes?: string;
  journal_entry_id?: string;
  created_at: string;
  updated_at: string;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter Types
export interface FilterParams {
  searchQuery?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
}

// Common Component Props
export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface EntityDialogProps<T> extends DialogProps {
  entity?: T | null;
  onSubmit: (data: T) => Promise<void>;
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expense: number;
}

export interface AccountData {
  name: string;
  amount: number;
  percentage?: number;
}

// Family Management Types
export interface Family {
  id: string;
  family_name: string;
  head_of_family_id?: string;
  tribe?: string;
  status: string;
  total_members: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  beneficiary_id: string;
  relationship: string;
  priority_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Request Management Types
export interface RequestType {
  id: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  description?: string;
  category?: string;
  requires_documents?: boolean;
  requires_attachments?: boolean;
  requires_amount?: boolean;
  required_documents?: string[];
  requires_approval: boolean;
  approval_levels?: number;
  sla_hours: number;
  max_amount?: number;
  is_active: boolean;
  icon?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface BeneficiaryRequest {
  id: string;
  request_number: string | null;
  beneficiary_id: string;
  request_type_id: string;
  description: string;
  amount: number | null;
  status: string | null;
  priority: string | null;
  assigned_to?: string | null;
  assigned_at?: string | null;
  submitted_at: string | null;
  reviewed_at?: string | null;
  approved_at?: string | null;
  decision_notes?: string | null;
  rejection_reason?: string | null;
  sla_due_at: string | null;
  is_overdue: boolean | null;
  attachments_count?: number;
  last_message_at?: string | null;
  created_at: string;
  updated_at: string | null;
  // Relations
  request_type?: RequestType;
  beneficiary?: { full_name: string };
}

export interface RequestAttachment {
  id: string;
  request_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  description?: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface RequestComment {
  id: string;
  request_id: string;
  user_id: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
}
