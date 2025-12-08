/**
 * Approval Service - خدمة الموافقات
 * @version 2.7.0
 */

import { supabase } from "@/integrations/supabase/client";

export interface ApprovalItem {
  id: string;
  status: string;
  approver_name?: string;
  notes?: string;
  created_at: string;
  approved_at?: string;
}

export class ApprovalService {
  static async getJournalApprovals(status?: string): Promise<ApprovalItem[]> {
    let query = supabase.from('approvals').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getDistributionApprovals(status?: string): Promise<ApprovalItem[]> {
    let query = supabase.from('distribution_approvals').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getLoanApprovals(status?: string): Promise<ApprovalItem[]> {
    let query = supabase.from('loan_approvals').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getPaymentApprovals(status?: string): Promise<ApprovalItem[]> {
    let query = supabase.from('payment_approvals').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

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
