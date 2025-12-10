/**
 * Historical Rental Details Hook
 * @version 2.8.76
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { 
  HistoricalRentalService,
  type HistoricalRentalDetail,
  type HistoricalRentalMonthlySummary,
  type CreateHistoricalRentalInput
} from '@/services/historical-rental.service';
import { RealtimeService } from '@/services';
import { toast } from 'sonner';

export const HISTORICAL_RENTAL_QUERY_KEY = ['historical-rental-details'] as const;

/**
 * جلب تفاصيل الإيجارات التاريخية لسنة مالية
 */
export function useHistoricalRentalDetails(fiscalYearClosingId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...HISTORICAL_RENTAL_QUERY_KEY, fiscalYearClosingId],
    queryFn: () => HistoricalRentalService.getByFiscalYearClosing(fiscalYearClosingId!),
    enabled: !!fiscalYearClosingId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!fiscalYearClosingId) return;

    const subscription = RealtimeService.subscribeToTable(
      'historical_rental_details',
      () => {
        queryClient.invalidateQueries({ queryKey: HISTORICAL_RENTAL_QUERY_KEY });
      }
    );

    return () => { subscription.unsubscribe(); };
  }, [fiscalYearClosingId, queryClient]);

  return {
    details: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * جلب الملخص الشهري
 */
export function useHistoricalRentalMonthlySummary(fiscalYearClosingId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...HISTORICAL_RENTAL_QUERY_KEY, 'monthly-summary', fiscalYearClosingId],
    queryFn: () => HistoricalRentalService.getMonthlySummary(fiscalYearClosingId!),
    enabled: !!fiscalYearClosingId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!fiscalYearClosingId) return;

    const subscription = RealtimeService.subscribeToTable(
      'historical_rental_details',
      () => {
        queryClient.invalidateQueries({ 
          queryKey: [...HISTORICAL_RENTAL_QUERY_KEY, 'monthly-summary'] 
        });
      }
    );

    return () => { subscription.unsubscribe(); };
  }, [fiscalYearClosingId, queryClient]);

  return {
    monthlySummary: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * جلب تفاصيل شهر محدد
 */
export function useHistoricalRentalByMonth(
  fiscalYearClosingId: string | undefined, 
  monthDate: string | undefined
) {
  return useQuery({
    queryKey: [...HISTORICAL_RENTAL_QUERY_KEY, fiscalYearClosingId, monthDate],
    queryFn: () => HistoricalRentalService.getByMonth(fiscalYearClosingId!, monthDate!),
    enabled: !!fiscalYearClosingId && !!monthDate,
  });
}

/**
 * إنشاء/تعديل/حذف تفاصيل الإيجارات
 */
export function useHistoricalRentalMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (input: CreateHistoricalRentalInput) => 
      HistoricalRentalService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HISTORICAL_RENTAL_QUERY_KEY });
      toast.success('تم إضافة السجل بنجاح');
    },
    onError: () => {
      toast.error('فشل في إضافة السجل');
    },
  });

  const createBatchMutation = useMutation({
    mutationFn: (inputs: CreateHistoricalRentalInput[]) => 
      HistoricalRentalService.createBatch(inputs),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: HISTORICAL_RENTAL_QUERY_KEY });
      toast.success(`تم إضافة ${data.length} سجل بنجاح`);
    },
    onError: () => {
      toast.error('فشل في إضافة السجلات');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateHistoricalRentalInput> }) =>
      HistoricalRentalService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HISTORICAL_RENTAL_QUERY_KEY });
      toast.success('تم تحديث السجل بنجاح');
    },
    onError: () => {
      toast.error('فشل في تحديث السجل');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => HistoricalRentalService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HISTORICAL_RENTAL_QUERY_KEY });
      toast.success('تم حذف السجل بنجاح');
    },
    onError: () => {
      toast.error('فشل في حذف السجل');
    },
  });

  return {
    create: createMutation.mutate,
    createBatch: createBatchMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Re-export types
export type { HistoricalRentalDetail, HistoricalRentalMonthlySummary, CreateHistoricalRentalInput };
