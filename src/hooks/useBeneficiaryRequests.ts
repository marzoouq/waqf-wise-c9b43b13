import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BeneficiaryRequestData {
  request_type_id: string;
  description: string;
  amount?: number;
  priority: string;
}

export function useBeneficiaryRequests(beneficiaryId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitRequest = useMutation({
    mutationFn: async (formData: BeneficiaryRequestData) => {
      const { error } = await supabase
        .from('beneficiary_requests')
        .insert({
          beneficiary_id: beneficiaryId,
          ...formData,
          submitted_at: new Date().toISOString(),
          status: 'قيد المراجعة',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast({
        title: 'تم الإرسال',
        description: 'تم تقديم الطلب بنجاح، سيتم مراجعته قريباً',
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

  return { submitRequest };
}
