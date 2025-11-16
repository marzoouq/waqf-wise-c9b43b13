import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Json = Database['public']['Tables']['custom_report_templates']['Row']['configuration'];

export interface ReportConfig {
  filters?: Record<string, unknown>;
  columns?: string[];
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string | null;
  report_type: string;
  configuration: Json;
  created_by: string | null;
  is_public: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Hook لإدارة التقارير المخصصة
 */
export function useCustomReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب قوالب التقارير
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['custom-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_report_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ReportTemplate[];
    },
  });

  // إنشاء قالب تقرير جديد
  const createTemplate = useMutation({
    mutationFn: async (template: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('custom_report_templates')
        .insert({
          ...template,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports'] });
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
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ReportTemplate> }) => {
      const { data, error } = await supabase
        .from('custom_report_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports'] });
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
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_report_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports'] });
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
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from('custom_report_templates')
        .update({ is_favorite: !isFavorite })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-reports'] });
    },
  });

  // تنفيذ التقرير
  const executeReport = async (template: ReportTemplate) => {
    const config = template.configuration as ReportConfig;
    
    // مثال: جلب بيانات المستفيدين
    if (template.report_type === 'beneficiaries') {
      let queryBuilder = supabase.from('beneficiaries').select('*');
      
      if (config.filters) {
        Object.entries(config.filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            queryBuilder = queryBuilder.eq(key, value);
          }
        });
      }
      
      if (config.sortBy) {
        queryBuilder = queryBuilder.order(config.sortBy, { ascending: config.sortOrder === 'asc' });
      }
      
      const { data, error } = await queryBuilder;
      
      if (error) throw error;
      return data;
    }
    
    return [];
  };

  return {
    templates,
    isLoading,
    createTemplate: createTemplate.mutateAsync,
    updateTemplate: updateTemplate.mutateAsync,
    deleteTemplate: deleteTemplate.mutateAsync,
    toggleFavorite: toggleFavorite.mutateAsync,
    executeReport,
  };
}
