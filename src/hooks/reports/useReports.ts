import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ReportService, type ReportTemplate } from "@/services/report.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useReports(reportType?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.REPORT_TEMPLATES(reportType),
    queryFn: async () => {
      const result = await ReportService.getTemplates(reportType);
      return result.templates;
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (template: ReportTemplate) => {
      const result = await ReportService.createTemplate(template);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORT_TEMPLATES() });
      toast({
        title: "تم إنشاء القالب بنجاح",
        description: "يمكنك الآن استخدام هذا القالب لتوليد التقارير",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء القالب",
        description: error.message,
      });
    },
  });

  const generateReport = useMutation({
    mutationFn: async (templateId: string) => {
      const result = await ReportService.generateReport(templateId);
      return result;
    },
    onSuccess: (result) => {
      toast({
        title: "تم توليد التقرير بنجاح",
        description: `التقرير يحتوي على ${result.data.length} سجل`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في توليد التقرير",
        description: error.message,
      });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      await ReportService.deleteTemplate(templateId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORT_TEMPLATES() });
      toast({
        title: "تم حذف القالب بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "خطأ في الحذف",
        description: error.message,
      });
    },
  });

  return {
    templates,
    isLoading,
    createTemplate: createTemplate.mutateAsync,
    generateReport: generateReport.mutateAsync,
    deleteTemplate: deleteTemplate.mutateAsync,
  };
}
