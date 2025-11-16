import { useMutation, useQueryClient, UseMutationOptions, QueryKey } from '@tanstack/react-query';
import { useToast } from './use-toast';

type OptimisticContext<TCacheData = unknown> = { previousData: TCacheData };

interface OptimisticMutationOptions<TData, TVariables, TCacheData = unknown> extends Omit<UseMutationOptions<TData, Error, TVariables, OptimisticContext<TCacheData>>, 'onMutate' | 'onError' | 'onSettled' | 'onSuccess'> {
  queryKey: QueryKey;
  updateCache?: (oldData: TCacheData, variables: TVariables) => TCacheData;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: TData, variables: TVariables, context: OptimisticContext<TCacheData>) => void;
}

/**
 * Hook للتحديثات التفاؤلية (Optimistic Updates)
 * يحدث الـ UI فوراً قبل إرسال الطلب للسيرفر
 */
export function useOptimisticMutation<TData = unknown, TVariables = void, TCacheData = unknown>({
  queryKey,
  updateCache,
  successMessage,
  errorMessage,
  mutationFn,
  onSuccess,
  ...options
}: OptimisticMutationOptions<TData, TVariables, TCacheData>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<TData, Error, TVariables, OptimisticContext<TCacheData>>({
    mutationFn,
    
    // قبل إرسال الطلب
    onMutate: async (variables) => {
      // إلغاء أي طلبات جارية
      await queryClient.cancelQueries({ queryKey });

      // حفظ البيانات القديمة للرجوع إليها في حالة الفشل
      const previousData = queryClient.getQueryData<TCacheData>(queryKey);

      // تحديث الـ cache بالبيانات الجديدة (Optimistic)
      if (updateCache && previousData) {
        queryClient.setQueryData(queryKey, updateCache(previousData, variables));
      }

      return { previousData: previousData as TCacheData };
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
        onSuccess(data, variables, context);
      }
    },

    // في حالة الفشل
    onError: (error, variables, context) => {
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
