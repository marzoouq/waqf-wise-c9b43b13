import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RequestService, RealtimeService } from '@/services';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTasks } from '@/hooks/useTasks';
import type { BeneficiaryRequest, RequestType } from '@/types';
import { logger } from '@/lib/logger';
import { createMutationErrorHandler } from '@/lib/errors';

// ===========================
// Request Types Hook
// ===========================

export const useRequestTypes = () => {
  const { data: requestTypes = [], isLoading } = useQuery({
    queryKey: ['request-types'],
    queryFn: () => RequestService.getRequestTypes(),
  });

  return {
    requestTypes: requestTypes as unknown as RequestType[],
    isLoading,
  };
};

// ===========================
// Beneficiary Requests Hook
// ===========================

export const useRequests = (beneficiaryId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addTask } = useTasks();

  // Fetch requests using RequestService
  const { data: requests = [], isLoading } = useQuery({
    queryKey: beneficiaryId ? ['requests', 'beneficiary', beneficiaryId] : ['requests'],
    queryFn: () => RequestService.getAll(beneficiaryId),
  });

  // Real-time subscription using RealtimeService
  useEffect(() => {
    const { unsubscribe } = RealtimeService.subscribeToTable('beneficiary_requests', () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    });

    return () => unsubscribe();
  }, [queryClient]);

  // Get single request
  const getRequest = (requestId: string) => {
    return useQuery({
      queryKey: ['request', requestId],
      queryFn: () => RequestService.getById(requestId),
      enabled: !!requestId,
    });
  };

  // Create request
  const createRequest = useMutation({
    mutationFn: async (newRequest: Omit<BeneficiaryRequest, 'id' | 'request_number' | 'created_at' | 'updated_at' | 'submitted_at' | 'sla_due_at' | 'is_overdue'>) => {
      const result = await RequestService.create({
        beneficiary_id: newRequest.beneficiary_id,
        request_type_id: newRequest.request_type_id || '',
        description: newRequest.description,
        amount: newRequest.amount,
        priority: newRequest.priority as 'منخفضة' | 'متوسطة' | 'عالية' | 'عاجلة' | undefined,
      });
      
      if (!result.success) throw new Error(result.message);
      
      // Fetch the created request to return
      if (result.id) {
        const created = await RequestService.getById(result.id);
        return created as BeneficiaryRequest;
      }
      throw new Error('Failed to get created request');
    },
    onSuccess: (data: BeneficiaryRequest) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      
      // إنشاء مهمة للمراجعة
      if (data?.status === 'قيد المراجعة') {
        addTask({
          task: `مراجعة طلب رقم ${data.request_number || 'جديد'}`,
          priority: data.priority === 'عاجلة' ? 'عالية' : 'متوسطة',
          status: 'pending',
        }).catch((error) => {
          logger.error(error, { context: 'add_request_task', severity: 'low' });
        });
      }
      
      toast({
        title: 'تم بنجاح',
        description: 'تم إرسال الطلب بنجاح',
      });
    },
    onError: createMutationErrorHandler({ context: 'add_request' }),
  });

  // Update request
  const updateRequest = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BeneficiaryRequest> }) => {
      return RequestService.update(id, {
        beneficiary_id: updates.beneficiary_id,
        request_type_id: updates.request_type_id,
        description: updates.description || '',
        amount: updates.amount,
        priority: updates.priority as 'منخفضة' | 'متوسطة' | 'عالية' | 'عاجلة' | undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث الطلب بنجاح',
      });
    },
    onError: createMutationErrorHandler({ context: 'update_request' }),
  });

  // Delete request
  const deleteRequest = useMutation({
    mutationFn: async (id: string) => {
      return RequestService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف الطلب بنجاح',
      });
    },
    onError: createMutationErrorHandler({ context: 'delete_request' }),
  });

  // Approve/Reject request
  const reviewRequest = useMutation({
    mutationFn: async ({
      id,
      status,
      decision_notes,
      rejection_reason,
    }: {
      id: string;
      status: 'موافق' | 'مرفوض';
      decision_notes?: string;
      rejection_reason?: string;
    }) => {
      return RequestService.review(id, status, decision_notes, rejection_reason);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast({
        title: 'تم بنجاح',
        description: variables.status === 'موافق' ? 'تم الموافقة على الطلب' : 'تم رفض الطلب',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    requests,
    isLoading,
    getRequest,
    createRequest,
    updateRequest,
    deleteRequest,
    reviewRequest,
  };
};
