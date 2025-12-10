/**
 * Hook لإدارة التقارير المخصصة
 * @version 2.8.72
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  CustomReportsService, 
  type CustomReportTemplate, 
  type ReportResult,
  type ReportConfig 
} from '@/services/report.service';
import { QUERY_KEYS } from '@/lib/query-keys';

export type { CustomReportTemplate as ReportTemplate, ReportResult, ReportConfig };

export function useCustomReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب قوالب التقارير
  const { data: templates = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.CUSTOM_REPORTS,
    queryFn: () => CustomReportsService.getCustomTemplates(),
  });

  // إنشاء قالب تقرير جديد
  const createTemplate = useMutation({
    mutationFn: (template: Omit<CustomReportTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => 
      CustomReportsService.createCustomTemplate(template),
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
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CustomReportTemplate> }) =>
      CustomReportsService.updateCustomTemplate(id, updates),
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
    mutationFn: (id: string) => CustomReportsService.deleteCustomTemplate(id),
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
      CustomReportsService.toggleFavorite(id, isFavorite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOM_REPORTS });
    },
  });

  // تنفيذ التقرير
  const executeReport = async (template: CustomReportTemplate): Promise<ReportResult> => {
    return CustomReportsService.executeReport(template);
  };

  // تنفيذ تقرير مباشر
  const executeDirectReport = async (
    reportType: string,
    selectedFields: string[],
    sortBy?: string
  ): Promise<ReportResult> => {
    return CustomReportsService.executeDirectReport(reportType, selectedFields, sortBy);
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
    REPORT_FIELDS: CustomReportsService.getReportFields(),
  };
}
