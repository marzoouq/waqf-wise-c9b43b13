import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ApprovalHistoryData {
  approval_type: 'loan' | 'payment' | 'distribution' | 'journal';
  approval_id: string;
  reference_id: string;
  action: 'approved' | 'rejected';
  performed_by: string;
  performed_by_name: string;
  notes?: string;
}

export function useApprovalHistory() {
  const queryClient = useQueryClient();

  const addToHistory = useMutation({
    mutationFn: async (data: ApprovalHistoryData) => {
      const { error } = await supabase
        .from('approval_history')
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval_history'] });
    },
  });

  return { addToHistory };
}
