/**
 * Hook لإدارة التقارير المخصصة
 * @version 2.8.55
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ReportsService, type ReportTemplate, type ReportResult } from '@/services/reports.service';
import { QUERY_KEYS } from '@/lib/query-keys';

export type { ReportTemplate, ReportResult };
export type { ReportConfig } from '@/services/reports.service';

export function useCustomReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب قوالب التقارير
  const { data: templates = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.CUSTOM_REPORTS,
    queryFn: () => ReportsService.getTemplates(),
  });

  // إنشاء قالب تقرير جديد
  const createTemplate = useMutation({
    mutationFn: (template: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => 
      ReportsService.createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOM_REPORTS });
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ قالب التقرير بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ قالب التقرير',
        variant: 'destructive',
      });
    },
  });

  // تحديث قالب تقرير
  const updateTemplate = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ReportTemplate> }) =>
      ReportsService.updateTemplate(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOM_REPORTS });
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث قالب التقرير بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث قالب التقرير',
        variant: 'destructive',
      });
    },
  });

  // حذف قالب تقرير
  const deleteTemplate = useMutation({
    mutationFn: (id: string) => ReportsService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOM_REPORTS });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف قالب التقرير بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف قالب التقرير',
        variant: 'destructive',
      });
    },
  });

  // تبديل المفضلة
  const toggleFavorite = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      ReportsService.toggleFavorite(id, isFavorite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOM_REPORTS });
    },
  });

  // تنفيذ التقرير
  const executeReport = async (template: ReportTemplate): Promise<ReportResult> => {
    return ReportsService.executeReport(template);
  };

  // تنفيذ تقرير مباشر
  const executeDirectReport = async (
    reportType: string,
    selectedFields: string[],
    sortBy?: string
  ): Promise<ReportResult> => {
    return ReportsService.executeDirectReport(reportType, selectedFields, sortBy);
  };

  return {
    templates,
    isLoading,
    createTemplate: createTemplate.mutateAsync,
    updateTemplate: updateTemplate.mutateAsync,
    deleteTemplate: deleteTemplate.mutateAsync,
    toggleFavorite: toggleFavorite.mutateAsync,
    executeReport,
    executeDirectReport,
    REPORT_FIELDS: ReportsService.getReportFields(),
  };
}
