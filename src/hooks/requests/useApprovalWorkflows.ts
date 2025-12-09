/**
 * Hook لمسارات الموافقات المتقدمة
 * @version 2.8.55
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ApprovalService } from '@/services';
import { QUERY_KEYS } from '@/lib/query-keys';
import type { Json } from '@/integrations/supabase/types';

export interface ApprovalLevel {
  level: number;
  role: string;
  required: boolean;
}

export interface ApprovalConditions {
  min_amount?: number;
  max_amount?: number;
  entity_subtype?: string;
}

export interface ApprovalWorkflow {
  id: string;
  workflow_name: string;
  entity_type: string;
  approval_levels: ApprovalLevel[];
  conditions?: ApprovalConditions;
  is_active: boolean;
  created_at: string;
}

export interface ApprovalStatus {
  id: string;
  workflow_id: string;
  entity_type: string;
  entity_id: string;
  current_level: number;
  total_levels: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  started_at: string;
  completed_at?: string;
}

export interface ApprovalStep {
  id: string;
  approval_status_id: string;
  level: number;
  approver_id?: string;
  approver_role: string;
  approver_name?: string;
  action?: 'approved' | 'rejected' | 'pending';
  notes?: string;
  actioned_at?: string;
}

function parseApprovalLevels(data: Json): ApprovalLevel[] {
  if (!data || !Array.isArray(data)) return [];
  return data as unknown as ApprovalLevel[];
}

function parseConditions(data: Json | null): ApprovalConditions | undefined {
  if (!data || typeof data !== 'object') return undefined;
  return data as ApprovalConditions;
}

export function useApprovalWorkflows() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: workflowsRaw, isLoading: isLoadingWorkflows } = useQuery({
    queryKey: QUERY_KEYS.APPROVAL_WORKFLOWS,
    queryFn: () => ApprovalService.getAllWorkflows(),
  });

  const workflows = (workflowsRaw || []).map(item => ({
    ...item,
    approval_levels: parseApprovalLevels(item.approval_levels),
    conditions: parseConditions(item.conditions),
    is_active: item.is_active ?? false,
  })) as ApprovalWorkflow[];

  const { data: statuses, isLoading: isLoadingStatuses } = useQuery({
    queryKey: QUERY_KEYS.APPROVAL_STATUSES,
    queryFn: () => ApprovalService.getAllStatuses(),
  });

  const createWorkflow = useMutation({
    mutationFn: (workflow: Omit<ApprovalWorkflow, 'id' | 'created_at'>) =>
      ApprovalService.createWorkflow({
        workflow_name: workflow.workflow_name,
        entity_type: workflow.entity_type,
        approval_levels: workflow.approval_levels,
        conditions: workflow.conditions,
        is_active: workflow.is_active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPROVAL_WORKFLOWS });
      toast({
        title: 'تم الحفظ',
        description: 'تم إنشاء مسار الموافقات بنجاح',
      });
    },
  });

  const initiateApproval = useMutation({
    mutationFn: async ({
      entityType,
      entityId,
      workflowId,
    }: {
      entityType: string;
      entityId: string;
      workflowId?: string;
    }) => {
      let workflow = workflows.find(w => w.id === workflowId);
      
      if (!workflow) {
        workflow = workflows.find(w => w.entity_type === entityType && w.is_active);
      }

      if (!workflow) {
        throw new Error('لم يتم العثور على مسار موافقات مناسب');
      }

      return ApprovalService.initiateApprovalStatus({
        workflowId: workflow.id,
        entityType,
        entityId,
        totalLevels: workflow.approval_levels.length,
        approvalLevels: workflow.approval_levels.map(l => ({ level: l.level, role: l.role })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPROVAL_STATUSES });
      toast({
        title: 'تم الإرسال',
        description: 'تم إرسال الطلب للموافقة',
      });
    },
  });

  const processApproval = useMutation({
    mutationFn: ({
      stepId,
      action,
      notes,
      approverName,
    }: {
      stepId: string;
      action: 'approved' | 'rejected';
      notes?: string;
      approverName: string;
    }) => ApprovalService.processApprovalStep({ stepId, action, notes, approverName }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPROVAL_STATUSES });
      toast({
        title: variables.action === 'approved' ? 'تمت الموافقة' : 'تم الرفض',
        description: variables.action === 'approved' 
          ? 'تمت الموافقة على الطلب بنجاح' 
          : 'تم رفض الطلب',
      });
    },
  });

  return {
    workflows,
    statuses: statuses || [],
    isLoading: isLoadingWorkflows || isLoadingStatuses,
    createWorkflow: createWorkflow.mutateAsync,
    initiateApproval: initiateApproval.mutateAsync,
    processApproval: processApproval.mutateAsync,
  };
}
