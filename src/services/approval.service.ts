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
    const tableMap: Record<string, 'approvals' | 'distribution_approvals' | 'loan_approvals' | 'payment_approvals'> = {
      journal: 'approvals',
      distribution: 'distribution_approvals',
      loan: 'loan_approvals',
      payment: 'payment_approvals',
    };
    const table = tableMap[type];
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
    const tableMap: Record<string, 'approvals' | 'distribution_approvals' | 'loan_approvals' | 'payment_approvals'> = {
      journal: 'approvals',
      distribution: 'distribution_approvals',
      loan: 'loan_approvals',
      payment: 'payment_approvals',
    };
    const table = tableMap[type];
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

  // ==================== الموافقات المعلقة الموحدة ====================
  static async getPendingApprovals(): Promise<{
    id: string;
    type: 'distribution' | 'request' | 'journal' | 'payment';
    title: string;
    amount?: number;
    date: Date;
    priority: 'high' | 'medium' | 'low';
    description: string;
  }[]> {
    const allApprovals: {
      id: string;
      type: 'distribution' | 'request' | 'journal' | 'payment';
      title: string;
      amount?: number;
      date: Date;
      priority: 'high' | 'medium' | 'low';
      description: string;
    }[] = [];

    const [distApprovalsResult, reqApprovalsResult, journalApprovalsResult] = await Promise.all([
      supabase
        .from('distribution_approvals')
        .select(`id, created_at, distributions(month, total_amount, beneficiaries_count)`)
        .eq('status', 'معلق')
        .eq('level', 3)
        .limit(5),
      supabase
        .from('request_approvals')
        .select(`id, created_at, beneficiary_requests(request_number, amount, priority, beneficiaries(full_name))`)
        .eq('status', 'معلق')
        .eq('level', 3)
        .limit(5),
      supabase
        .from('approvals')
        .select(`id, created_at, journal_entries(entry_number, description)`)
        .eq('status', 'pending')
        .limit(5)
    ]);

    if (distApprovalsResult.error) throw distApprovalsResult.error;
    if (reqApprovalsResult.error) throw reqApprovalsResult.error;
    if (journalApprovalsResult.error) throw journalApprovalsResult.error;

    interface DistApproval {
      id: string;
      created_at: string;
      distributions?: {
        month?: string;
        total_amount?: number;
        beneficiaries_count?: number;
      };
    }

    interface ReqApproval {
      id: string;
      created_at: string;
      beneficiary_requests?: {
        request_number?: string;
        amount?: number;
        priority?: string;
        beneficiaries?: { full_name?: string };
      };
    }

    interface JournalApprovalItem {
      id: string;
      created_at: string;
      journal_entries?: {
        entry_number?: string;
        description?: string;
      };
    }

    if (distApprovalsResult.data) {
      (distApprovalsResult.data as DistApproval[]).forEach((app) => {
        if (app.distributions) {
          allApprovals.push({
            id: app.id,
            type: 'distribution',
            title: `توزيع ${app.distributions.month}`,
            amount: app.distributions.total_amount,
            date: new Date(app.created_at),
            priority: 'high',
            description: `توزيع لـ ${app.distributions.beneficiaries_count} مستفيد`
          });
        }
      });
    }

    if (reqApprovalsResult.data) {
      (reqApprovalsResult.data as ReqApproval[]).forEach((app) => {
        if (app.beneficiary_requests?.beneficiaries) {
          allApprovals.push({
            id: app.id,
            type: 'request',
            title: `طلب ${app.beneficiary_requests.request_number || ''}`,
            amount: app.beneficiary_requests.amount,
            date: new Date(app.created_at),
            priority: app.beneficiary_requests.priority === 'عاجلة' ? 'high' : 'medium',
            description: `من ${app.beneficiary_requests.beneficiaries.full_name}`
          });
        }
      });
    }

    if (journalApprovalsResult.data) {
      (journalApprovalsResult.data as JournalApprovalItem[]).forEach((app) => {
        if (app.journal_entries) {
          allApprovals.push({
            id: app.id,
            type: 'journal',
            title: `قيد ${app.journal_entries.entry_number}`,
            date: new Date(app.created_at),
            priority: 'medium',
            description: app.journal_entries.description
          });
        }
      });
    }

    return allApprovals
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.date.getTime() - a.date.getTime();
      })
      .slice(0, 6);
  }

  // ==================== موافقات الطلبات الخاصة ====================
  static async getRequestApprovalsByRequestId(requestId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("request_approvals")
      .select("*")
      .eq("request_id", requestId)
      .order("level", { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async upsertRequestApproval(approval: {
    request_id: string;
    level: number;
    status: string;
    notes?: string;
    approved_at?: string;
    approver_id?: string;
    approver_name: string;
  }): Promise<any> {
    // التحقق من وجود موافقة سابقة
    const { data: existing } = await supabase
      .from("request_approvals")
      .select("id")
      .eq("request_id", approval.request_id)
      .eq("level", approval.level)
      .maybeSingle();

    if (existing?.id) {
      const { data, error } = await supabase
        .from("request_approvals")
        .update({
          status: approval.status,
          notes: approval.notes,
          approved_at: approval.approved_at,
          approver_id: approval.approver_id,
          approver_name: approval.approver_name,
        })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from("request_approvals")
      .insert([approval])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async updateRequestApproval(id: string, updates: Partial<any>): Promise<any> {
    const { data, error } = await supabase
      .from("request_approvals")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * جلب دور المستخدم للموافقات
   */
  static async getUserRole(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data?.role || null;
  }

  // ==================== مسارات الموافقات المتقدمة ====================
  static async getAllWorkflows() {
    const { data, error } = await supabase
      .from('approval_workflows')
      .select('id, workflow_name, entity_type, approval_levels, conditions, is_active, created_at, created_by, updated_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getAllStatuses() {
    const { data, error } = await supabase
      .from('approval_status')
      .select('*, approval_steps(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createWorkflow(workflow: {
    workflow_name: string;
    entity_type: string;
    approval_levels: any[];
    conditions?: any;
    is_active: boolean;
  }) {
    const { data, error } = await supabase
      .from('approval_workflows')
      .insert({
        workflow_name: workflow.workflow_name,
        entity_type: workflow.entity_type,
        approval_levels: workflow.approval_levels as any,
        conditions: workflow.conditions as any,
        is_active: workflow.is_active,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('فشل إنشاء المسار');
    return data;
  }

  static async initiateApprovalStatus(params: {
    workflowId: string;
    entityType: string;
    entityId: string;
    totalLevels: number;
    approvalLevels: { level: number; role: string }[];
  }) {
    const { data: statusData, error: statusError } = await supabase
      .from('approval_status')
      .insert({
        workflow_id: params.workflowId,
        entity_type: params.entityType,
        entity_id: params.entityId,
        current_level: 1,
        total_levels: params.totalLevels,
        status: 'pending',
      })
      .select()
      .maybeSingle();

    if (statusError) throw statusError;
    if (!statusData) throw new Error('فشل إنشاء حالة الموافقة');

    const steps = params.approvalLevels.map(level => ({
      approval_status_id: statusData.id,
      level: level.level,
      approver_role: level.role,
      action: 'pending',
    }));

    const { error: stepsError } = await supabase
      .from('approval_steps')
      .insert(steps);

    if (stepsError) throw stepsError;

    return statusData;
  }

  static async processApprovalStep(params: {
    stepId: string;
    action: 'approved' | 'rejected';
    notes?: string;
    approverName: string;
  }) {
    const { data: step, error: stepError } = await supabase
      .from('approval_steps')
      .update({
        action: params.action,
        notes: params.notes,
        approver_name: params.approverName,
        actioned_at: new Date().toISOString(),
      })
      .eq('id', params.stepId)
      .select()
      .maybeSingle();

    if (stepError) throw stepError;
    if (!step) throw new Error('الخطوة غير موجودة');

    const { data: status, error: statusFetchError } = await supabase
      .from('approval_status')
      .select('*, approval_steps(*)')
      .eq('id', step.approval_status_id)
      .maybeSingle();

    if (statusFetchError) throw statusFetchError;
    if (!status) throw new Error('الحالة غير موجودة');

    if (params.action === 'rejected') {
      await supabase
        .from('approval_status')
        .update({
          status: 'rejected',
          completed_at: new Date().toISOString(),
        })
        .eq('id', status.id);
    } else {
      const steps = status.approval_steps as any[];
      const allApproved = steps
        .filter((s) => s.level <= (step.level ?? 0))
        .every((s) => s.action === 'approved');

      const isLastLevel = (step.level ?? 0) === status.total_levels;

      if (allApproved && isLastLevel) {
        await supabase
          .from('approval_status')
          .update({
            status: 'approved',
            completed_at: new Date().toISOString(),
          })
          .eq('id', status.id);
      } else {
        await supabase
          .from('approval_status')
          .update({
            current_level: (step.level ?? 0) + 1,
          })
          .eq('id', status.id);
      }
    }

    return step;
  }

  // ==================== موافقات القيود البسيطة ====================
  static async getSimpleApprovals() {
    const { data, error } = await supabase
      .from('approvals')
      .select('id, journal_entry_id, approver_name, status, notes, approved_at, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async addSimpleApproval(approvalData: {
    journal_entry_id: string;
    approver_name: string;
    status: 'approved' | 'rejected';
    notes?: string;
  }) {
    const { error } = await supabase
      .from('approvals')
      .insert({
        ...approvalData,
        approved_at: new Date().toISOString(),
      });
    
    if (error) throw error;
  }
}
