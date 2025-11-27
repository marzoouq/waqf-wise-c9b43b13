/**
 * أنواع صفوف الجداول للاستخدام في UnifiedDataTable
 */

import type { Database } from "@/integrations/supabase/types";
import type { EmergencyAid } from "./loans";
import type { Loan } from "@/hooks/useLoans";

// Badge variants type
export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// Badge variants mapping type
export type BadgeVariantMap = Record<string, BadgeVariant>;

// Emergency Aid Row with beneficiary data
export type EmergencyAidRow = EmergencyAid;

// Loan Row with beneficiary data
export type LoanRow = Loan;

// Custom Report Row
export interface CustomReportRow {
  id: string;
  name: string;
  report_type: string;
  is_public: boolean;
  is_scheduled: boolean;
  created_at: string;
  template_config?: Record<string, unknown>;
  filters?: Record<string, unknown>;
  columns?: Record<string, unknown>;
}

// Auto Journal Template Row
export interface AutoJournalTemplateRow {
  id: string;
  template_name: string;
  trigger_event: string;
  debit_accounts: Record<string, unknown>;
  credit_accounts: Record<string, unknown>;
  description?: string;
  is_active: boolean;
  priority?: number;
  created_at: string;
  updated_at?: string;
}

// Payment Voucher Row
export interface PaymentVoucherRow {
  id: string;
  voucher_number: string;
  voucher_type: string;
  voucher_date: string;
  total_amount: number;
  description?: string;
  status: string;
  payment_method?: string;
  bank_reference?: string;
  created_at: string;
  beneficiaries?: {
    full_name: string;
    national_id: string;
  };
}

// Family Member Row
export interface FamilyMemberRow {
  id: string;
  full_name: string;
  beneficiary_type?: string;
  relationship?: string;
  gender?: string;
  status: string;
}

// Family Relationship Row
export interface FamilyRelationshipRow {
  id: string;
  beneficiary_id: string;
  related_beneficiary_id: string;
  relationship_type: string;
  created_at: string;
}

// Saved Search Row
export interface SavedSearchRow {
  id: string;
  search_name: string;
  search_criteria: Record<string, unknown>;
  created_at: string;
  usage_count?: number;
}

// Audit Log Row
export interface AuditLogRow {
  id: string;
  action_type: string;
  user_email?: string;
  table_name?: string;
  record_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  description?: string;
  severity?: string;
  created_at: string;
}

// Maintenance Schedule Row
export interface MaintenanceScheduleRow {
  id: string;
  property_id: string;
  title: string;
  description?: string;
  scheduled_date: string;
  status: string;
  estimated_cost?: number;
  actual_cost?: number;
}

// Maintenance Provider Row
export interface MaintenanceProviderRow {
  id: string;
  name: string;
  service_type: string;
  phone?: string;
  email?: string;
  rating?: number;
  is_active: boolean;
}

// Smart Search Result Row
export interface SmartSearchResultRow {
  id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  description?: string;
  relevance_score: number;
}

// OCR Log Row
export interface OCRLogRow {
  id: string;
  document_name: string;
  document_type?: string;
  extracted_text?: string;
  confidence_score?: number;
  status: string;
  created_at: string;
}

// Request with type Row
export interface RequestWithTypeRow {
  id: string;
  request_number: string;
  status: string;
  priority?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  request_type?: {
    name_ar: string;
    name_en?: string;
  };
  request_types?: {
    name_ar: string;
    name_en?: string;
  };
  beneficiaries?: {
    full_name: string;
    national_id: string;
  };
}

// Contract with Property Row
export interface ContractWithPropertyRow {
  id: string;
  contract_number: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  monthly_rent?: number;
  status: string;
  properties?: {
    name: string;
    property_type?: string;
    address?: string;
  };
}

// Journal Entry Line Row
export interface JournalEntryLineRow {
  id: string;
  journal_entry_id: string;
  account_id: string;
  line_number: number;
  debit_amount: number;
  credit_amount: number;
  description?: string;
  accounts?: {
    name_ar: string;
    code: string;
    account_type: string;
  };
}

// Aging Report Item Row
export interface AgingReportItemRow {
  id: string;
  beneficiary_name: string;
  total_amount: number;
  current: number;
  days_30: number;
  days_60: number;
  days_90: number;
  over_90: number;
}

// General Ledger Entry Row
export interface GeneralLedgerEntryRow {
  id: string;
  entry_date: string;
  entry_number: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
  journal_entry_id?: string;
}

// Distribution Beneficiary Row (for TestPhase4)
export interface DistributionBeneficiaryRow {
  id: string;
  full_name: string;
  beneficiary_type?: string;
  share_percentage?: number;
  allocated_amount?: number;
}

// Test Distribution Row
export interface TestDistributionRow {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  executed_at?: string;
  approved_at?: string;
  distribution_details?: Array<{ beneficiary_id: string }>;
}
