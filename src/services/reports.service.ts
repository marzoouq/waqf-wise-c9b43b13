/**
 * Reports Service - خدمة التقارير المخصصة
 * @version 2.8.55
 */

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

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

const getDbField = (reportType: string, arabicLabel: string): string | null => {
  const fields = REPORT_FIELDS[reportType];
  if (!fields) return null;
  const field = fields.find(f => f.label === arabicLabel);
  return field?.dbField || null;
};

export class ReportsService {
  static getReportFields() {
    return REPORT_FIELDS;
  }

  static async getTemplates(): Promise<ReportTemplate[]> {
    const { data, error } = await supabase
      .from('custom_report_templates')
      .select('id, name, description, report_type, configuration, created_by, is_public, is_favorite, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as ReportTemplate[];
  }

  static async createTemplate(template: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<ReportTemplate> {
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
    return data as ReportTemplate;
  }

  static async updateTemplate(id: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const { data, error } = await supabase
      .from('custom_report_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('القالب غير موجود');
    return data as ReportTemplate;
  }

  static async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('custom_report_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  static async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const { error } = await supabase
      .from('custom_report_templates')
      .update({ is_favorite: !isFavorite })
      .eq('id', id);
    
    if (error) throw error;
  }

  static async executeReport(template: ReportTemplate): Promise<ReportResult> {
    const config = template.configuration as ReportConfig;
    const reportType = template.report_type;
    
    const selectedFields = config.fields || config.columns || [];
    const dbFields = selectedFields
      .map(field => getDbField(reportType, field))
      .filter((f): f is string => f !== null);
    
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
  }

  static async executeDirectReport(
    reportType: string,
    selectedFields: string[],
    sortBy?: string
  ): Promise<ReportResult> {
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

    return this.executeReport(mockTemplate);
  }
}
