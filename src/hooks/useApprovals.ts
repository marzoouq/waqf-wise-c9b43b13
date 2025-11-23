import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ApprovalData {
  journal_entry_id: string;
  approver_name: string;
  status: 'approved' | 'rejected';
  notes?: string;
}

export function useApprovals() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // جلب الموافقات
  const { data: approvals, isLoading } = useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approvals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // إضافة موافقة
  const addApproval = useMutation({
    mutationFn: async (approvalData: ApprovalData) => {
      const { error } = await supabase
        .from('approvals')
        .insert({
          ...approvalData,
          approved_at: new Date().toISOString(),
        });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['journal_entries'] });
      
      toast({
        title: variables.status === 'approved' ? 'تمت الموافقة' : 'تم الرفض',
        description: variables.status === 'approved' 
          ? 'تمت الموافقة على القيد المحاسبي بنجاح'
          : 'تم رفض القيد المحاسبي',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء معالجة الطلب',
        variant: 'destructive',
      });
    },
  });

  return { 
    approvals, 
    isLoading, 
    addApproval 
  };
}
