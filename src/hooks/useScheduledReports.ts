import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ScheduledReport {
  id: string;
  report_template_id: string;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  cron_expression?: string;
  recipients: Array<{ user_id: string; email: string }>;
  delivery_method: 'email' | 'storage' | 'both';
  last_run_at?: string;
  next_run_at?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export function useScheduledReports() {
  return useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_report_jobs')
        .select(`
          *,
          report_template:report_template_id(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        recipients: item.recipients as Array<{ user_id: string; email: string }>
      }));
    },
  });
}

export function useCreateScheduledReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: Omit<ScheduledReport, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // حساب next_run_at بناءً على schedule_type
      const nextRun = calculateNextRun(report.schedule_type);
      
      const { data, error } = await supabase
        .from('scheduled_report_jobs')
        .insert({
          ...report,
          created_by: user?.id,
          next_run_at: nextRun,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('تم جدولة التقرير بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل جدولة التقرير: ' + error.message);
    },
  });
}

export function useUpdateScheduledReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, report }: { id: string; report: Partial<ScheduledReport> }) => {
      const { data, error } = await supabase
        .from('scheduled_report_jobs')
        .update(report)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('تم تحديث الجدولة بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل تحديث الجدولة: ' + error.message);
    },
  });
}

export function useDeleteScheduledReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scheduled_report_jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      toast.success('تم حذف الجدولة بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل حذف الجدولة: ' + error.message);
    },
  });
}

export function useTriggerScheduledReport() {
  return useMutation({
    mutationFn: async (reportId: string) => {
      const { data, error } = await supabase.functions.invoke('generate-scheduled-report', {
        body: { reportId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('تم تشغيل التقرير بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل تشغيل التقرير: ' + error.message);
    },
  });
}

function calculateNextRun(scheduleType: string): string {
  const now = new Date();
  
  switch (scheduleType) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
    default:
      now.setDate(now.getDate() + 1);
  }
  
  return now.toISOString();
}