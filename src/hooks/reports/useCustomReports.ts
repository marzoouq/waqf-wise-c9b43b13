import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Json = Database['public']['Tables']['custom_report_templates']['Row']['configuration'];

export interface ReportConfig {
  filters?: Record<string, unknown>;
  columns?: string[];
  fields?: string[];
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

export interface ReportResult {
  data: Record<string, unknown>[];
  columns: { key: string; label: string }[];
  totalCount: number;
  generatedAt: string;
}

// تعريف الحقول لكل نوع تقرير
const REPORT_FIELDS: Record<string, { dbField: string; label: string }[]> = {
  beneficiaries: [
    { dbField: 'full_name', label: 'الاسم' },
    { dbField: 'category', label: 'الفئة' },
    { dbField: 'status', label: 'الحالة' },
    { dbField: 'national_id', label: 'رقم الهوية' },
    { dbField: 'phone', label: 'الجوال' },
    { dbField: 'city', label: 'المدينة' },
    { dbField: 'total_received', label: 'إجمالي المستلم' },
    { dbField: 'account_balance', label: 'الرصيد' },
  ],
  payments: [
    { dbField: 'payment_number', label: 'رقم الدفعة' },
    { dbField: 'payment_date', label: 'التاريخ' },
    { dbField: 'amount', label: 'المبلغ' },
    { dbField: 'description', label: 'الوصف' },
    { dbField: 'status', label: 'الحالة' },
    { dbField: 'payment_method', label: 'طريقة الدفع' },
  ],
  properties: [
    { dbField: 'name', label: 'اسم العقار' },
    { dbField: 'type', label: 'النوع' },
    { dbField: 'area', label: 'المساحة' },
    { dbField: 'estimated_value', label: 'القيمة' },
    { dbField: 'status', label: 'الحالة' },
    { dbField: 'address', label: 'العنوان' },
  ],
  distributions: [
    { dbField: 'distribution_number', label: 'رقم التوزيع' },
    { dbField: 'distribution_date', label: 'التاريخ' },
    { dbField: 'total_amount', label: 'المبلغ الكلي' },
    { dbField: 'beneficiary_count', label: 'عدد المستفيدين' },
    { dbField: 'status', label: 'الحالة' },
  ],
  loans: [
    { dbField: 'loan_number', label: 'رقم القرض' },
    { dbField: 'amount', label: 'المبلغ' },
    { dbField: 'duration_months', label: 'المدة' },
    { dbField: 'monthly_payment', label: 'القسط الشهري' },
    { dbField: 'status', label: 'الحالة' },
    { dbField: 'remaining_amount', label: 'المبلغ المتبقي' },
  ],
  contracts: [
    { dbField: 'contract_number', label: 'رقم العقد' },
    { dbField: 'tenant_name', label: 'المستأجر' },
    { dbField: 'monthly_rent', label: 'الإيجار الشهري' },
    { dbField: 'start_date', label: 'تاريخ البداية' },
    { dbField: 'end_date', label: 'تاريخ الانتهاء' },
    { dbField: 'status', label: 'الحالة' },
  ],
};

// تحويل الحقل العربي إلى حقل قاعدة البيانات
const getDbField = (reportType: string, arabicLabel: string): string | null => {
  const fields = REPORT_FIELDS[reportType];
  if (!fields) return null;
  const field = fields.find(f => f.label === arabicLabel);
  return field?.dbField || null;
};

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
        .select('id, name, description, report_type, configuration, created_by, is_public, is_favorite, created_at, updated_at')
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
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('فشل إنشاء القالب');
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
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('القالب غير موجود');
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

  // تنفيذ التقرير - موسع لجميع الأنواع
  const executeReport = async (template: ReportTemplate): Promise<ReportResult> => {
    const config = template.configuration as ReportConfig;
    const reportType = template.report_type;
    
    // تحديد الحقول المطلوبة
    const selectedFields = config.fields || config.columns || [];
    const dbFields = selectedFields
      .map(field => getDbField(reportType, field))
      .filter((f): f is string => f !== null);
    
    // إذا لم تحدد حقول، استخدم الحقول الافتراضية
    const fieldsToSelect = dbFields.length > 0 
      ? dbFields.join(', ')
      : REPORT_FIELDS[reportType]?.map(f => f.dbField).join(', ') || '*';

    let data: Record<string, unknown>[] = [];

    switch (reportType) {
      case 'beneficiaries': {
        const { data: result, error } = await supabase
          .from('beneficiaries')
          .select(fieldsToSelect)
          .order(config.sortBy || 'created_at', { ascending: config.sortOrder === 'asc' });
        
        if (error) throw error;
        data = (result as unknown as Record<string, unknown>[]) || [];
        break;
      }

      case 'payments': {
        const { data: result, error } = await supabase
          .from('payments')
          .select(fieldsToSelect)
          .order(config.sortBy || 'payment_date', { ascending: config.sortOrder === 'asc' });
        
        if (error) throw error;
        data = (result as unknown as Record<string, unknown>[]) || [];
        break;
      }

      case 'properties': {
        const { data: result, error } = await supabase
          .from('properties')
          .select(fieldsToSelect)
          .order(config.sortBy || 'created_at', { ascending: config.sortOrder === 'asc' });
        
        if (error) throw error;
        data = (result as unknown as Record<string, unknown>[]) || [];
        break;
      }

      case 'distributions': {
        const { data: result, error } = await supabase
          .from('distributions')
          .select(fieldsToSelect)
          .order(config.sortBy || 'distribution_date', { ascending: config.sortOrder === 'asc' });
        
        if (error) throw error;
        data = (result as unknown as Record<string, unknown>[]) || [];
        break;
      }

      case 'loans': {
        const { data: result, error } = await supabase
          .from('loans')
          .select(fieldsToSelect)
          .order(config.sortBy || 'created_at', { ascending: config.sortOrder === 'asc' });
        
        if (error) throw error;
        data = (result as unknown as Record<string, unknown>[]) || [];
        break;
      }

      case 'contracts': {
        const { data: result, error } = await supabase
          .from('contracts')
          .select(fieldsToSelect)
          .order(config.sortBy || 'start_date', { ascending: config.sortOrder === 'asc' });
        
        if (error) throw error;
        data = (result as unknown as Record<string, unknown>[]) || [];
        break;
      }

      default:
        throw new Error(`نوع التقرير غير مدعوم: ${reportType}`);
    }

    // بناء الأعمدة للعرض
    const columns = selectedFields.length > 0
      ? selectedFields.map(label => {
          const dbField = getDbField(reportType, label);
          return { key: dbField || label, label };
        })
      : REPORT_FIELDS[reportType]?.map(f => ({ key: f.dbField, label: f.label })) || [];

    return {
      data,
      columns,
      totalCount: data.length,
      generatedAt: new Date().toISOString(),
    };
  };

  // تنفيذ تقرير مباشر (بدون قالب محفوظ)
  const executeDirectReport = async (
    reportType: string,
    selectedFields: string[],
    sortBy?: string
  ): Promise<ReportResult> => {
    const mockTemplate: ReportTemplate = {
      id: 'direct',
      name: 'تقرير مباشر',
      description: null,
      report_type: reportType,
      configuration: {
        fields: selectedFields,
        sortBy,
      },
      created_by: null,
      is_public: false,
      is_favorite: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return executeReport(mockTemplate);
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
    REPORT_FIELDS,
  };
}
