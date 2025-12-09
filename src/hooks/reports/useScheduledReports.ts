/**
 * Scheduled Reports Hooks
 * يستخدم ScheduledReportService
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScheduledReportService, type ScheduledReport } from '@/services/scheduled-report.service';
import { QUERY_KEYS } from '@/lib/query-keys';
import { toast } from 'sonner';

export type { ScheduledReport };

export function useScheduledReports() {
  return useQuery({
    queryKey: QUERY_KEYS.SCHEDULED_REPORTS,
    queryFn: () => ScheduledReportService.getAll(),
  });
}

export function useCreateScheduledReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (report: Omit<ScheduledReport, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => 
      ScheduledReportService.create(report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHEDULED_REPORTS });
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
    mutationFn: ({ id, report }: { id: string; report: Partial<ScheduledReport> }) =>
      ScheduledReportService.update(id, report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHEDULED_REPORTS });
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
    mutationFn: (id: string) => ScheduledReportService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHEDULED_REPORTS });
      toast.success('تم حذف الجدولة بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل حذف الجدولة: ' + error.message);
    },
  });
}

export function useTriggerScheduledReport() {
  return useMutation({
    mutationFn: (reportId: string) => ScheduledReportService.trigger(reportId),
    onSuccess: () => {
      toast.success('تم تشغيل التقرير بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل تشغيل التقرير: ' + error.message);
    },
  });
}
