import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface CustomReport {
  id: string;
  name: string;
  description?: string;
  report_type: 'sql' | 'chart' | 'ai';
  configuration: any;
  is_shared: boolean;
  is_favorite: boolean;
  run_count: number;
  last_run_at?: string;
  created_at: string;
}

interface CreateReportData {
  name: string;
  description?: string;
  report_type: 'sql' | 'chart' | 'ai';
  configuration: any;
  is_shared?: boolean;
}

export function useCustomReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب التقارير المخصصة
  const { data: reports, isLoading } = useQuery({
    queryKey: ['custom-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CustomReport[];
    },
  });

  // إنشاء تقرير جديد
  const createReport = useMutation({
    mutationFn: async (reportData: CreateReportData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('custom_reports')
        .insert({
          ...reportData,
          created_by: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports'] });
      toast({
        title: 'تم إنشاء التقرير',
        description: 'تم حفظ التقرير المخصص بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في إنشاء التقرير',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // تشغيل تقرير
  const runReport = useMutation({
    mutationFn: async (reportId: string) => {
      const report = reports?.find(r => r.id === reportId);
      if (!report) throw new Error('Report not found');

      let result;
      
      if (report.report_type === 'sql') {
        // تنفيذ SQL query - في الإنتاج يحتاج دالة مخصصة
        // حالياً نعيد البيانات من الجدول مباشرة
        result = { message: 'SQL queries need custom RPC function implementation' };
      } else if (report.report_type === 'ai') {
        // إنشاء تقرير AI
        const response = await supabase.functions.invoke('generate-ai-insights', {
          body: {
            reportType: report.configuration.dataSource,
            filters: report.configuration.filters,
          },
        });
        if (response.error) throw response.error;
        result = response.data;
      }

      // تحديث عدد المرات المشغلة
      await supabase
        .from('custom_reports')
        .update({
          run_count: (report.run_count || 0) + 1,
          last_run_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في تشغيل التقرير',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // تبديل المفضلة
  const toggleFavorite = useMutation({
    mutationFn: async (reportId: string) => {
      const report = reports?.find(r => r.id === reportId);
      if (!report) throw new Error('Report not found');

      const { error } = await supabase
        .from('custom_reports')
        .update({ is_favorite: !report.is_favorite })
        .eq('id', reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports'] });
    },
  });

  // حذف تقرير
  const deleteReport = useMutation({
    mutationFn: async (reportId: string) => {
      const { error } = await supabase
        .from('custom_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports'] });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف التقرير بنجاح',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في الحذف',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    reports,
    isLoading,
    createReport: createReport.mutateAsync,
    runReport: runReport.mutateAsync,
    toggleFavorite: toggleFavorite.mutateAsync,
    deleteReport: deleteReport.mutateAsync,
    isCreating: createReport.isPending,
    isRunning: runReport.isPending,
    isDeleting: deleteReport.isPending,
  };
}