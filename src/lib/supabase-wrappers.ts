/**
 * Type-safe helpers للعمليات الشائعة مع Supabase
 * يوفر type safety محسّن مع تقليل استخدام any
 */

import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * نتيجة عملية Supabase
 */
export interface SupabaseResult<T> {
  data: T | null;
  error: PostgrestError | Error | null;
}

/**
 * Type guard للتحقق من نجاح العملية
 */
export function isSuccess<T>(result: SupabaseResult<T>): result is { data: T; error: null } {
  return result.error === null && result.data !== null;
}

/**
 * Type guard للتحقق من فشل العملية
 */
export function isError<T>(result: SupabaseResult<T>): result is { data: null; error: Error } {
  return result.error !== null;
}

/**
 * Helper آمن لاستدعاء RPC functions
 */
export async function safeRPC<T>(
  functionName: string,
  params: Record<string, unknown>
): Promise<SupabaseResult<T>> {
  try {
    // استخدام type assertion واضح وآمن
    const { data, error } = await supabase.rpc(functionName as never, params as never);
    
    if (error) {
      return { data: null, error };
    }
    
    return { data: data as T, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Type-safe wrapper لاستدعاء calculate_account_balance
 */
export async function calculateAccountBalance(accountId: string): Promise<SupabaseResult<number>> {
  return safeRPC<number>('calculate_account_balance', { account_uuid: accountId });
}

/**
 * Type-safe wrapper لاستدعاء create_auto_journal_entry
 */
export async function createAutoJournalEntry(params: {
  triggerEvent: string;
  referenceId: string;
  amount: number;
  description: string;
  transactionDate?: string;
}): Promise<SupabaseResult<{ id: string; entry_number: string }>> {
  return safeRPC('create_auto_journal_entry', {
    p_trigger_event: params.triggerEvent,
    p_reference_id: params.referenceId,
    p_amount: params.amount,
    p_description: params.description,
    p_transaction_date: params.transactionDate || new Date().toISOString().split('T')[0]
  });
}

/**
 * Type-safe wrapper لاستدعاء check_rate_limit
 */
export async function checkRateLimit(params: {
  email: string;
  ipAddress: string;
  maxAttempts?: number;
  timeWindowMinutes?: number;
}): Promise<SupabaseResult<boolean>> {
  return safeRPC<boolean>('check_rate_limit', {
    p_email: params.email,
    p_ip_address: params.ipAddress,
    p_max_attempts: params.maxAttempts || 5,
    p_time_window_minutes: params.timeWindowMinutes || 15
  });
}

/**
 * Type-safe wrapper لاستدعاء payment_requires_approval
 */
export async function paymentRequiresApproval(amount: number): Promise<SupabaseResult<boolean>> {
  return safeRPC<boolean>('payment_requires_approval', { p_amount: amount });
}

/**
 * Type-safe wrapper لاستدعاء calculate_precise_loan_schedule
 */
export async function calculatePreciseLoanSchedule(params: {
  loanId: string;
  principal: number;
  termMonths: number;
  interestRate: number;
  startDate: string;
}): Promise<SupabaseResult<Array<{
  installment_number: number;
  due_date: string;
  principal_amount: number;
  interest_amount: number;
  total_amount: number;
  remaining_balance: number;
}>>> {
  return safeRPC('calculate_precise_loan_schedule', {
    p_loan_id: params.loanId,
    p_principal: params.principal,
    p_term_months: params.termMonths,
    p_interest_rate: params.interestRate,
    p_start_date: params.startDate
  });
}

/**
 * Type-safe wrapper لاستدعاء log_login_attempt
 */
export async function logLoginAttempt(params: {
  email: string;
  ipAddress: string;
  success: boolean;
  userAgent?: string;
}): Promise<SupabaseResult<void>> {
  return safeRPC<void>('log_login_attempt', {
    p_email: params.email,
    p_ip_address: params.ipAddress,
    p_success: params.success,
    p_user_agent: params.userAgent
  });
}
