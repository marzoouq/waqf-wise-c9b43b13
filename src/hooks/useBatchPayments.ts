import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface PaymentSchedule {
  id: string;
  distribution_id: string;
  scheduled_date: string;
  scheduled_amount: number;
  status: 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled';
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
    queryKey: ['payment-schedules', distributionId],
    queryFn: async () => {
      let query = supabase
        .from('payment_schedules')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (distributionId) {
        query = query.eq('distribution_id', distributionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PaymentSchedule[];
    },
    enabled: !!distributionId,
  });

  // إنشاء جدول مدفوعات
  const createSchedule = useMutation({
    mutationFn: async (schedule: Omit<PaymentSchedule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('payment_schedules')
        .insert([schedule])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
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
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PaymentSchedule> }) => {
      const { data, error } = await supabase
        .from('payment_schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
    },
  });

  // حذف جدول المدفوعات
  const deleteSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payment_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الجدول',
      });
    },
  });

  // إنشاء عدة جداول مجدولة (تقسيم توزيع إلى دفعات)
  const createBatchSchedules = useCallback(
    async (
      distributionId: string,
      totalAmount: number,
      numberOfBatches: number,
      startDate: Date
    ) => {
      const amountPerBatch = totalAmount / numberOfBatches;
      const schedules: Omit<PaymentSchedule, 'id' | 'created_at' | 'updated_at'>[] = [];

      for (let i = 0; i < numberOfBatches; i++) {
        const scheduledDate = new Date(startDate);
        scheduledDate.setDate(scheduledDate.getDate() + i * 7); // أسبوع بين كل دفعة

        schedules.push({
          distribution_id: distributionId,
          scheduled_date: scheduledDate.toISOString().split('T')[0],
          scheduled_amount: Math.round(amountPerBatch * 100) / 100,
          status: 'scheduled',
          batch_number: `BATCH-${i + 1}`,
          notes: `دفعة ${i + 1} من ${numberOfBatches}`,
        });
      }

      try {
        const { data, error } = await supabase
          .from('payment_schedules')
          .insert(schedules)
          .select();

        if (error) throw error;

        queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
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
        // تحديث الحالة إلى "جاري المعالجة"
        await updateSchedule.mutateAsync({
          id: scheduleId,
          updates: { status: 'processing' },
        });

        // محاكاة المعالجة (في الواقع هنا سيتم استدعاء API البنك)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // تحديث الحالة إلى "مكتمل"
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
    async (distributionId: string) => {
      const pendingSchedules = schedules.filter(
        (s) => s.distribution_id === distributionId && s.status === 'scheduled'
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
  const stats = {
    total: schedules.length,
    scheduled: schedules.filter((s) => s.status === 'scheduled').length,
    processing: schedules.filter((s) => s.status === 'processing').length,
    completed: schedules.filter((s) => s.status === 'completed').length,
    failed: schedules.filter((s) => s.status === 'failed').length,
    totalAmount: schedules.reduce((sum, s) => sum + s.scheduled_amount, 0),
    completedAmount: schedules
      .filter((s) => s.status === 'completed')
      .reduce((sum, s) => sum + s.scheduled_amount, 0),
  };

  return {
    schedules,
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
