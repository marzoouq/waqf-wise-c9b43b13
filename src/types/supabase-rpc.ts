/**
 * Type definitions for Supabase RPC functions
 * يوفر type safety كامل لجميع استدعاءات RPC
 */

import { Database } from '@/integrations/supabase/types';

// استخراج أنواع الجداول
type Tables = Database['public']['Tables'];

// أنواع معاملات RPC Functions
export interface RPCParams {
  calculate_account_balance: {
    account_uuid: string;
  };
  
  create_auto_journal_entry: {
    p_trigger_event: string;
    p_reference_id: string;
    p_amount: number;
    p_description: string;
    p_transaction_date?: string;
  };
  
  calculate_precise_loan_schedule: {
    p_loan_id: string;
    p_principal: number;
    p_term_months: number;
    p_interest_rate: number;
    p_start_date: string;
  };
  
  check_rate_limit: {
    p_user_id: string;
    p_action_type: string;
    p_limit: number;
    p_window_minutes: number;
  };
  
  log_login_attempt: {
    p_user_id: string;
    p_success: boolean;
    p_ip_address?: string;
    p_user_agent?: string;
  };
  
  payment_requires_approval: {
    p_amount: number;
  };
  
  check_all_approvals_completed: {
    p_reference_id: string;
    p_approval_type: string;
  };
}

// أنواع النتائج من RPC Functions
export interface RPCResults {
  calculate_account_balance: number;
  
  create_auto_journal_entry: {
    id: string;
    entry_number: string;
    entry_date: string;
    description: string;
    total_debit: number;
    total_credit: number;
    status: string;
  };
  
  calculate_precise_loan_schedule: Array<{
    installment_number: number;
    due_date: string;
    principal_amount: number;
    interest_amount: number;
    total_amount: number;
    remaining_balance: number;
  }>;
  
  check_rate_limit: boolean;
  
  log_login_attempt: void;
  
  payment_requires_approval: boolean;
  
  check_all_approvals_completed: boolean;
}

// Type helper للـ RPC calls
export type RPCFunction = keyof RPCParams;

export type RPCCall<T extends RPCFunction> = {
  function: T;
  params: RPCParams[T];
};

export type RPCResponse<T extends RPCFunction> = RPCResults[T];

// أنواع للجداول الخاصة (غير موجودة في types.ts)
export type AuditLogTable = 'audit_logs';
export type BankAccountTable = 'bank_accounts';
export type BankStatementTable = 'bank_statements';
export type BankTransactionTable = 'bank_transactions';
export type CashFlowTable = 'cash_flows';
export type FamilyTable = 'families';
export type FamilyMemberTable = 'family_members';
export type InternalMessageTable = 'internal_messages';
export type LoanApprovalTable = 'loan_approvals';
export type PaymentApprovalTable = 'payment_approvals';
export type RequestApprovalTable = 'request_approvals';
export type RequestTypeTable = 'request_types';
export type SystemSettingTable = 'system_settings';
export type TribeTable = 'tribes';

// Union type لجميع أسماء الجداول
export type TableName = keyof Tables | 
  AuditLogTable | 
  BankAccountTable | 
  BankStatementTable | 
  BankTransactionTable | 
  CashFlowTable | 
  FamilyTable | 
  FamilyMemberTable | 
  InternalMessageTable | 
  LoanApprovalTable | 
  PaymentApprovalTable | 
  RequestApprovalTable | 
  RequestTypeTable | 
  SystemSettingTable | 
  TribeTable;

// Helper type للحصول على نوع Row من اسم الجدول
export type RowType<T extends TableName> = T extends keyof Tables 
  ? Tables[T]['Row'] 
  : Record<string, unknown>;

export type InsertType<T extends TableName> = T extends keyof Tables 
  ? Tables[T]['Insert'] 
  : Record<string, unknown>;

export type UpdateType<T extends TableName> = T extends keyof Tables 
  ? Tables[T]['Update'] 
  : Record<string, unknown>;
