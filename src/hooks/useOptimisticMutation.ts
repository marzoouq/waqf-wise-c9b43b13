import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { useToast } from './use-toast';

interface OptimisticMutationOptions<TData, TVariables> extends Omit<UseMutationOptions<TData, Error, TVariables>, 'onMutate' | 'onError' | 'onSettled'> {
  queryKey: any[];
  updateCache?: (oldData: any, variables: TVariables) => any;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Hook للتحديثات التفاؤلية (Optimistic Updates)
 * يحدث الـ UI فوراً قبل إرسال الطلب للسيرفر
 */
export function useOptimisticMutation<TData = unknown, TVariables = void>({
  queryKey,
  updateCache,
  successMessage,
  errorMessage,
  mutationFn,
  onSuccess,
  ...options
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<TData, Error, TVariables>({
    mutationFn,
    
    // قبل إرسال الطلب
    onMutate: async (variables) => {
      // إلغاء أي طلبات جارية
      await queryClient.cancelQueries({ queryKey });

      // حفظ البيانات القديمة للرجوع إليها في حالة الفشل
      const previousData = queryClient.getQueryData(queryKey);

      // تحديث الـ cache بالبيانات الجديدة (Optimistic)
      if (updateCache && previousData) {
        queryClient.setQueryData(queryKey, (old: any) => updateCache(old, variables));
      }

      return { previousData };
    },

    // في حالة النجاح
    onSuccess: (data, variables, context) => {
      if (successMessage) {
        toast({
          title: 'تم بنجاح',
          description: successMessage,
        });
      }
      
      if (onSuccess) {
        onSuccess(data, variables, context as any);
      }
    },

    // في حالة الفشل
    onError: (error, variables, context: any) => {
      // الرجوع للبيانات القديمة
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      toast({
        title: 'حدث خطأ',
        description: errorMessage || error.message,
        variant: 'destructive',
      });
    },

    // في كل الحالات
    onSettled: () => {
      // إعادة جلب البيانات للتأكد من التزامن
      queryClient.invalidateQueries({ queryKey });
    },

    ...options,
  });
}
