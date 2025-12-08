/**
 * Approval Service - خدمة الموافقات
 * @version 2.8.3
 */

import { supabase } from "@/integrations/supabase/client";
import { JournalApproval, PaymentForApproval } from "@/types";
import { DistributionForApproval, RequestWithBeneficiary } from "@/types/approvals";

export interface ApprovalItem {
  id: string;
  status: string;
  approver_name?: string;
  notes?: string;
  created_at: string;
  approved_at?: string;
}

export interface ApprovalsStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export class ApprovalService {
  // ==================== إحصائيات عامة ====================
  static async getOverviewStats(): Promise<ApprovalsStats> {
    const { data: journalApprovals } = await supabase.from("approvals").select("status");
    const { data: distributionApprovals } = await supabase.from("distribution_approvals").select("status");
    const { data: requestApprovals } = await supabase.from("request_approvals").select("status");

    const allApprovals = [
      ...(journalApprovals || []),
      ...(distributionApprovals || []),
      ...(requestApprovals || []),
    ];

    return {
      total: allApprovals.length,
      pending: allApprovals.filter((a) => a.status === "pending" || a.status === "معلق").length,
      approved: allApprovals.filter((a) => a.status === "approved" || a.status === "موافق").length,
      rejected: allApprovals.filter((a) => a.status === "rejected" || a.status === "مرفوض").length,
    };
  }

  // ==================== موافقات القيود ====================
  static async getJournalApprovals(status?: string): Promise<ApprovalItem[]> {
    let query = supabase.from('approvals').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getJournalApprovalsWithEntries(): Promise<JournalApproval[]> {
    const { data, error } = await supabase
      .from("approvals")
      .select(`
        *,
        journal_entry:journal_entries(
          id,
          entry_number,
          entry_date,
          description,
          status
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as unknown as JournalApproval[];
  }

  // ==================== موافقات التوزيعات ====================
  static async getDistributionApprovals(status?: string): Promise<ApprovalItem[]> {
    let query = supabase.from('distribution_approvals').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getDistributionApprovalsWithDetails(): Promise<DistributionForApproval[]> {
    const { data, error } = await supabase
      .from("distributions")
      .select(`
        *,
        distribution_approvals(*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as unknown as DistributionForApproval[];
  }

  // ==================== موافقات المدفوعات ====================
  static async getPaymentApprovals(status?: string): Promise<ApprovalItem[]> {
    let query = supabase.from('payment_approvals').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getPaymentApprovalsWithDetails(): Promise<PaymentForApproval[]> {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        beneficiaries(full_name, national_id),
        payment_approvals(*)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as PaymentForApproval[];
  }

  static async processPaymentApproval(
    approvalId: string,
    status: string,
    notes: string,
    approverId?: string
  ): Promise<void> {
    const { error } = await supabase
      .from("payment_approvals")
      .update({
        status,
        notes,
        approved_at: new Date().toISOString(),
        approver_id: approverId
      })
      .eq("id", approvalId);

    if (error) throw error;
  }

  // ==================== موافقات الطلبات ====================
  static async getRequestApprovals(): Promise<RequestWithBeneficiary[]> {
    const { data, error } = await supabase
      .from("beneficiary_requests")
      .select(`
        *,
        beneficiaries(full_name, national_id),
        request_types(name_ar, name)
      `)
      .in("status", ["قيد المراجعة", "معلق"])
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as unknown as RequestWithBeneficiary[];
  }

  // ==================== موافقات القروض ====================
  static async getLoanApprovals(status?: string): Promise<ApprovalItem[]> {
    let query = supabase.from('loan_approvals').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // ==================== عمليات الموافقة/الرفض ====================
  static async approveItem(type: string, id: string, approverName: string, notes?: string): Promise<void> {
    const tables: Record<string, string> = {
      journal: 'approvals',
      distribution: 'distribution_approvals',
      loan: 'loan_approvals',
      payment: 'payment_approvals',
    };
    const table = tables[type] as any;
    if (!table) throw new Error('Invalid type');
    
    const { error } = await supabase.from(table).update({
      status: 'موافق',
      approver_name: approverName,
      notes,
      approved_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) throw error;
  }

  static async rejectItem(type: string, id: string, approverName: string, notes?: string): Promise<void> {
    const tables: Record<string, string> = {
      journal: 'approvals',
      distribution: 'distribution_approvals',
      loan: 'loan_approvals',
      payment: 'payment_approvals',
    };
    const table = tables[type] as any;
    if (!table) throw new Error('Invalid type');
    
    const { error } = await supabase.from(table).update({
      status: 'مرفوض',
      approver_name: approverName,
      notes,
      approved_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) throw error;
  }

  static async getApprovalsSummary() {
    const [journals, distributions, loans, payments] = await Promise.all([
      this.getJournalApprovals(),
      this.getDistributionApprovals(),
      this.getLoanApprovals(),
      this.getPaymentApprovals(),
    ]);
    const all = [...journals, ...distributions, ...loans, ...payments];
    return {
      pending: all.filter(a => a.status === 'معلق').length,
      approved: all.filter(a => a.status === 'موافق').length,
      rejected: all.filter(a => a.status === 'مرفوض').length,
    };
  }

  static async getApprovalWorkflows() {
    const { data, error } = await supabase.from('approval_workflows').select('*').eq('is_active', true);
    if (error) throw error;
    return data || [];
  }
}
