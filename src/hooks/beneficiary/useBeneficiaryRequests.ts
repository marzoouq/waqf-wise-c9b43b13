/**
 * useBeneficiaryRequests Hook - تقديم طلبات المستفيدين
 * @version 2.8.65
 * 
 * يستخدم RequestService للوصول لقاعدة البيانات
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/ui/use-toast';
import { QUERY_KEYS } from "@/lib/query-keys";
import { RequestService } from '@/services';

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
      const priorityMap: Record<string, 'عاجلة' | 'عالية' | 'متوسطة' | 'منخفضة'> = {
        'عاجلة': 'عاجلة',
        'عالية': 'عالية',
        'متوسطة': 'متوسطة',
        'منخفضة': 'منخفضة',
      };
      
      const result = await RequestService.create({
        beneficiary_id: beneficiaryId,
        request_type_id: formData.request_type_id,
        description: formData.description,
        amount: formData.amount,
        priority: priorityMap[formData.priority] || 'متوسطة',
      });

      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS });
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
