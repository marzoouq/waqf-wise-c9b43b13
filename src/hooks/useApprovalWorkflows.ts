import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

interface ApprovalStatusWithSteps {
  id: string;
  workflow_id: string | null;
  entity_type: string;
  entity_id: string;
  current_level: number | null;
  total_levels: number;
  status: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string | null;
  approval_steps: ApprovalStep[];
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

  const { data: workflows, isLoading: isLoadingWorkflows } = useQuery({
    queryKey: ['approval_workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        approval_levels: parseApprovalLevels(item.approval_levels),
        conditions: parseConditions(item.conditions),
        is_active: item.is_active ?? false,
      })) as ApprovalWorkflow[];
    },
  });

  const { data: statuses, isLoading: isLoadingStatuses } = useQuery({
    queryKey: ['approval_status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_status')
        .select('*, approval_steps(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ApprovalStatusWithSteps[];
    },
  });

  const createWorkflow = useMutation({
    mutationFn: async (workflow: Omit<ApprovalWorkflow, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('approval_workflows')
        .insert({
          workflow_name: workflow.workflow_name,
          entity_type: workflow.entity_type,
          approval_levels: workflow.approval_levels as unknown as Json,
          conditions: workflow.conditions as unknown as Json,
          is_active: workflow.is_active,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval_workflows'] });
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
      let workflow = workflows?.find(w => w.id === workflowId);
      
      if (!workflow) {
        workflow = workflows?.find(
          w => w.entity_type === entityType && w.is_active
        );
      }

      if (!workflow) {
        throw new Error('لم يتم العثور على مسار موافقات مناسب');
      }

      const { data: statusData, error: statusError } = await supabase
        .from('approval_status')
        .insert({
          workflow_id: workflow.id,
          entity_type: entityType,
          entity_id: entityId,
          current_level: 1,
          total_levels: workflow.approval_levels.length,
          status: 'pending',
        })
        .select()
        .single();

      if (statusError) throw statusError;

      const steps = workflow.approval_levels.map(level => ({
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval_status'] });
      toast({
        title: 'تم الإرسال',
        description: 'تم إرسال الطلب للموافقة',
      });
    },
  });

  const processApproval = useMutation({
    mutationFn: async ({
      stepId,
      action,
      notes,
      approverName,
    }: {
      stepId: string;
      action: 'approved' | 'rejected';
      notes?: string;
      approverName: string;
    }) => {
      const { data: step, error: stepError } = await supabase
        .from('approval_steps')
        .update({
          action,
          notes,
          approver_name: approverName,
          actioned_at: new Date().toISOString(),
        })
        .eq('id', stepId)
        .select()
        .single();

      if (stepError) throw stepError;

      const { data: status, error: statusFetchError } = await supabase
        .from('approval_status')
        .select('*, approval_steps(*)')
        .eq('id', step.approval_status_id)
        .single();

      if (statusFetchError) throw statusFetchError;

      if (action === 'rejected') {
        await supabase
          .from('approval_status')
          .update({
            status: 'rejected',
            completed_at: new Date().toISOString(),
          })
          .eq('id', status.id);
      } else {
        const steps = status.approval_steps as ApprovalStep[];
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
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['approval_status'] });
      queryClient.invalidateQueries({ queryKey: ['approval_steps'] });
      toast({
        title: variables.action === 'approved' ? 'تمت الموافقة' : 'تم الرفض',
        description: variables.action === 'approved' 
          ? 'تمت الموافقة على الطلب بنجاح' 
          : 'تم رفض الطلب',
      });
    },
  });

  return {
    workflows: workflows || [],
    statuses: statuses || [],
    isLoading: isLoadingWorkflows || isLoadingStatuses,
    createWorkflow: createWorkflow.mutateAsync,
    initiateApproval: initiateApproval.mutateAsync,
    processApproval: processApproval.mutateAsync,
  };
}
