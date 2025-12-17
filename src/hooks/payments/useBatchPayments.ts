/**
 * useBatchPayments Hook
 * Hook لإدارة المدفوعات المجدولة
 * @version 2.8.68
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentService, PaymentScheduleResult } from '@/services';
import { useToast } from '@/hooks/ui/use-toast';
import { QUERY_KEYS } from '@/lib/query-keys';

export interface PaymentSchedule {
  id: string;
  distribution_id: string;
  scheduled_date: string;
  scheduled_amount: number;
  status: string;
  batch_number?: string;
  processed_at?: string;
  error_message?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useBatchPayments(distributionId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingProgress, setProcessingProgress] = useState(0);

  // جلب جداول المدفوعات
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.PAYMENT_SCHEDULES(distributionId),
    queryFn: () => PaymentService.getPaymentSchedules(distributionId),
    enabled: !!distributionId,
  });

  // إنشاء جدول مدفوعات
  const createSchedule = useMutation({
    mutationFn: (schedule: Omit<PaymentSchedule, 'id' | 'created_at' | 'updated_at'>) =>
      PaymentService.createPaymentSchedule(schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENT_SCHEDULES() });
      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة جدول المدفوعات',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل إضافة الجدول',
        variant: 'destructive',
      });
    },
  });

  // تحديث جدول المدفوعات
  const updateSchedule = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PaymentSchedule> }) =>
      PaymentService.updatePaymentSchedule(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENT_SCHEDULES() });
    },
  });

  // حذف جدول المدفوعات
  const deleteSchedule = useMutation({
    mutationFn: (id: string) => PaymentService.deletePaymentSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENT_SCHEDULES() });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الجدول',
      });
    },
  });

  // إنشاء عدة جداول مجدولة (تقسيم توزيع إلى دفعات)
  const createBatchSchedules = useCallback(
    async (
      distId: string,
      totalAmount: number,
      numberOfBatches: number,
      startDate: Date
    ) => {
      const amountPerBatch = totalAmount / numberOfBatches;
      const schedulesToCreate = [];

      for (let i = 0; i < numberOfBatches; i++) {
        const scheduledDate = new Date(startDate);
        scheduledDate.setDate(scheduledDate.getDate() + i * 7);

        schedulesToCreate.push({
          distribution_id: distId,
          scheduled_date: scheduledDate.toISOString().split('T')[0],
          scheduled_amount: Math.round(amountPerBatch * 100) / 100,
          status: 'scheduled' as const,
          batch_number: `BATCH-${i + 1}`,
          notes: `دفعة ${i + 1} من ${numberOfBatches}`,
        });
      }

      try {
        const data = await PaymentService.createBatchSchedules(schedulesToCreate);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENT_SCHEDULES() });
        toast({
          title: 'تم بنجاح',
          description: `تم إنشاء ${numberOfBatches} دفعة مجدولة`,
        });
        return data;
      } catch (error) {
        toast({
          title: 'خطأ',
          description: error instanceof Error ? error.message : 'فشل إنشاء الجداول',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [queryClient, toast]
  );

  // معالجة دفعة واحدة
  const processBatch = useCallback(
    async (scheduleId: string) => {
      try {
        await updateSchedule.mutateAsync({
          id: scheduleId,
          updates: { status: 'processing' },
        });

        await new Promise((resolve) => setTimeout(resolve, 2000));

        await updateSchedule.mutateAsync({
          id: scheduleId,
          updates: {
            status: 'completed',
            processed_at: new Date().toISOString(),
          },
        });

        toast({
          title: 'تم بنجاح',
          description: 'تمت معالجة الدفعة',
        });

        return true;
      } catch (error) {
        await updateSchedule.mutateAsync({
          id: scheduleId,
          updates: {
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'خطأ غير متوقع',
          },
        });

        toast({
          title: 'فشلت المعالجة',
          description: error instanceof Error ? error.message : 'حدث خطأ',
          variant: 'destructive',
        });

        return false;
      }
    },
    [updateSchedule, toast]
  );

  // معالجة جميع الدفعات المعلقة
  const processAllPending = useCallback(
    async (distId: string) => {
      const pendingSchedules = schedules.filter(
        (s: PaymentSchedule) => s.distribution_id === distId && s.status === 'scheduled'
      );

      if (pendingSchedules.length === 0) {
        toast({
          title: 'تنبيه',
          description: 'لا توجد دفعات معلقة للمعالجة',
        });
        return;
      }

      setProcessingProgress(0);

      for (let i = 0; i < pendingSchedules.length; i++) {
        await processBatch(pendingSchedules[i].id);
        setProcessingProgress(((i + 1) / pendingSchedules.length) * 100);
      }

      toast({
        title: 'اكتملت المعالجة',
        description: `تمت معالجة ${pendingSchedules.length} دفعة`,
      });
    },
    [schedules, processBatch, toast]
  );

  // إحصائيات الجداول
  const typedSchedules = schedules as PaymentSchedule[];
  const stats = {
    total: typedSchedules.length,
    scheduled: typedSchedules.filter((s) => s.status === 'scheduled').length,
    processing: typedSchedules.filter((s) => s.status === 'processing').length,
    completed: typedSchedules.filter((s) => s.status === 'completed').length,
    failed: typedSchedules.filter((s) => s.status === 'failed').length,
    totalAmount: typedSchedules.reduce((sum, s) => sum + s.scheduled_amount, 0),
    completedAmount: typedSchedules
      .filter((s) => s.status === 'completed')
      .reduce((sum, s) => sum + s.scheduled_amount, 0),
  };

  return {
    schedules: typedSchedules,
    isLoading,
    stats,
    processingProgress,
    createSchedule: createSchedule.mutateAsync,
    updateSchedule: updateSchedule.mutateAsync,
    deleteSchedule: deleteSchedule.mutateAsync,
    createBatchSchedules,
    processBatch,
    processAllPending,
  };
}
