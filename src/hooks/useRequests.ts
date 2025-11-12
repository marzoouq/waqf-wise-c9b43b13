import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTasks } from '@/hooks/useTasks';
import type { BeneficiaryRequest, RequestType } from '@/types';

// ===========================
// Request Types Hook
// ===========================

export const useRequestTypes = () => {
  const { data: requestTypes = [], isLoading } = useQuery({
    queryKey: ['request-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('request_types' as any)
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as unknown as RequestType[];
    },
  });

  return {
    requestTypes,
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

  // Fetch requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: beneficiaryId ? ['requests', 'beneficiary', beneficiaryId] : ['requests'],
    queryFn: async () => {
      let query = supabase
        .from('beneficiary_requests' as any)
        .select(`
          *,
          request_type:request_types(*),
          beneficiary:beneficiaries(
            id,
            full_name,
            national_id,
            phone
          )
        `)
        .order('submitted_at', { ascending: false });

      if (beneficiaryId) {
        query = query.eq('beneficiary_id', beneficiaryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as BeneficiaryRequest[];
    },
  });

  // Get single request
  const getRequest = (requestId: string) => {
    return useQuery({
      queryKey: ['request', requestId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('beneficiary_requests' as any)
          .select(`
            *,
            request_type:request_types(*),
            beneficiary:beneficiaries(*)
          `)
          .eq('id', requestId)
          .maybeSingle();

        if (error) throw error;
        return data as unknown as BeneficiaryRequest | null;
      },
      enabled: !!requestId,
    });
  };

  // Create request
  const createRequest = useMutation({
    mutationFn: async (newRequest: Omit<BeneficiaryRequest, 'id' | 'request_number' | 'created_at' | 'updated_at' | 'submitted_at' | 'sla_due_at' | 'is_overdue'>) => {
      const { data, error } = await supabase
        .from('beneficiary_requests' as any)
        .insert({
          ...newRequest,
          submitted_at: new Date().toISOString(),
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      
      // إنشاء مهمة للمراجعة
      if (data?.status === 'قيد المراجعة') {
        try {
          await addTask({
            task: `مراجعة طلب رقم ${data.request_number || 'جديد'}`,
            priority: data.priority === 'عاجلة' ? 'عالية' : 'متوسطة',
            status: 'pending',
          });
        } catch (error) {
          console.error("Error adding task:", error);
        }
      }
      
      toast({
        title: 'تم بنجاح',
        description: 'تم إرسال الطلب بنجاح',
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

  // Update request
  const updateRequest = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BeneficiaryRequest> }) => {
      const { data, error } = await supabase
        .from('beneficiary_requests' as any)
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث الطلب بنجاح',
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

  // Delete request
  const deleteRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('beneficiary_requests' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف الطلب بنجاح',
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
      const updates: any = {
        status,
        decision_notes,
        rejection_reason,
        reviewed_at: new Date().toISOString(),
      };

      if (status === 'موافق') {
        updates.approved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('beneficiary_requests' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
