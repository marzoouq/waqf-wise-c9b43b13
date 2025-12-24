/**
 * Report Service - خدمة التقارير (Facade)
 * @version 2.9.69
 * 
 * هذا الملف يعمل كـ Facade للتوافق مع الكود القديم
 * الخدمات الفعلية موجودة في مجلد report/
 */

import { 
  ReportTemplateService, 
  FinancialReportService, 
  AnalysisService,
  type CashFlowData,
  type PropertyWithContracts,
  type OperationRecord,
} from './report/index';
import { DisclosureService } from './disclosure.service';
import type { ReportTemplate, ReportFilters } from "@/types/reports/index";
import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from '@/lib/logger/production-logger';

// Re-export types
export type { ReportTemplate, CashFlowData, PropertyWithContracts, OperationRecord };

// Storage key for favorites
const FAVORITES_STORAGE_KEY = 'report_favorites';

// Custom Reports Types
export interface CustomReportTemplate {
  id: string;
  name: string;
  report_type: string;
  fields: string[];
  filters?: Record<string, unknown>;
  sort_by?: string;
  is_favorite?: boolean;
  is_public?: boolean;
  description?: string;
  configuration?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface ReportColumn {
  key: string;
  label: string;
}

export interface ReportResult {
  data: Record<string, unknown>[];
  total: number;
  totalCount: number;
  columns: ReportColumn[];
  generatedAt: string;
}

export interface ReportConfig {
  type: string;
  fields: string[];
  sortBy?: string;
}

// Helper to get favorites from localStorage
function getFavorites(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Helper to save favorites to localStorage
function saveFavorites(favorites: string[]): void {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

// Field labels for reports
const FIELD_LABELS: Record<string, Record<string, string>> = {
  beneficiaries: {
    full_name: 'الاسم الكامل',
    national_id: 'رقم الهوية',
    phone: 'الهاتف',
    email: 'البريد الإلكتروني',
    status: 'الحالة',
    category: 'الفئة',
    total_received: 'إجمالي المستلم',
    account_balance: 'رصيد الحساب',
    created_at: 'تاريخ التسجيل',
  },
  properties: {
    name: 'اسم العقار',
    location: 'الموقع',
    property_type: 'نوع العقار',
    status: 'الحالة',
    monthly_rent: 'الإيجار الشهري',
    total_units: 'عدد الوحدات',
    occupied_units: 'الوحدات المؤجرة',
    created_at: 'تاريخ الإضافة',
  },
  distributions: {
    distribution_date: 'تاريخ التوزيع',
    total_amount: 'المبلغ الإجمالي',
    status: 'الحالة',
    distribution_month: 'شهر التوزيع',
    beneficiaries_count: 'عدد المستفيدين',
    created_at: 'تاريخ الإنشاء',
  },
};

/**
 * Custom Reports Service
 */
export const CustomReportsService = {
  async getCustomTemplates(): Promise<CustomReportTemplate[]> {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    const favorites = getFavorites();
    
    return (data || []).map(t => ({
      id: t.id,
      name: t.template_name,
      report_type: t.report_type,
      fields: Array.isArray(t.columns) ? t.columns as string[] : [],
      is_favorite: favorites.includes(t.id),
      is_public: false,
      description: '',
      configuration: {},
      created_at: t.created_at,
    }));
  },

  async createCustomTemplate(template: Omit<CustomReportTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<CustomReportTemplate> {
    const { data, error } = await supabase
      .from('report_templates')
      .insert([{ template_name: template.name, report_type: template.report_type, columns: template.fields }])
      .select()
      .single();
    if (error) throw error;
    return { 
      id: data.id, 
      name: data.template_name, 
      report_type: data.report_type, 
      fields: Array.isArray(data.columns) ? data.columns as string[] : [],
      is_favorite: false,
      is_public: false,
      description: '',
      configuration: {},
    };
  },

  async updateCustomTemplate(id: string, updates: Partial<CustomReportTemplate>): Promise<void> {
    const { error } = await supabase
      .from('report_templates')
      .update({ template_name: updates.name, columns: updates.fields })
      .eq('id', id);
    if (error) throw error;
  },

  async deleteCustomTemplate(id: string): Promise<void> {
    const { error } = await supabase.from('report_templates').delete().eq('id', id);
    if (error) throw error;
    
    // Remove from favorites if exists
    const favorites = getFavorites();
    saveFavorites(favorites.filter(f => f !== id));
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const favorites = getFavorites();
    if (isFavorite) {
      if (!favorites.includes(id)) {
        saveFavorites([...favorites, id]);
      }
    } else {
      saveFavorites(favorites.filter(f => f !== id));
    }
  },

  async executeReport(template: CustomReportTemplate): Promise<ReportResult> {
    return this.executeDirectReport(template.report_type, template.fields, template.sort_by);
  },

  async executeDirectReport(reportType: string, selectedFields: string[], sortBy?: string): Promise<ReportResult> {
    const tableName = reportType as 'beneficiaries' | 'properties' | 'distributions';
    const validTables = ['beneficiaries', 'properties', 'distributions'];
    
    if (!validTables.includes(tableName)) {
      return { data: [], total: 0, totalCount: 0, columns: [], generatedAt: new Date().toISOString() };
    }

    // Build select string from fields
    const selectFields = selectedFields.length > 0 ? selectedFields.join(', ') : '*';
    
    let query = supabase.from(tableName).select(selectFields, { count: 'exact' });
    
    // Apply sorting if specified
    if (sortBy && selectedFields.includes(sortBy)) {
      query = query.order(sortBy, { ascending: true });
    }
    
    // Limit results
    query = query.limit(1000);
    
    const { data, error, count } = await query;
    
    if (error) {
      productionLogger.error('Error executing report:', error);
      return { data: [], total: 0, totalCount: 0, columns: [], generatedAt: new Date().toISOString() };
    }
    
    // Build columns from field labels
    const fieldLabels = FIELD_LABELS[tableName] || {};
    const columns: ReportColumn[] = selectedFields.map(field => ({
      key: field,
      label: fieldLabels[field] || field,
    }));
    
    const resultData = (data || []) as unknown as Record<string, unknown>[];
    
    return {
      data: resultData,
      total: resultData.length,
      totalCount: count || 0,
      columns,
      generatedAt: new Date().toISOString(),
    };
  },

  getReportFields() {
    return {
      beneficiaries: ['full_name', 'national_id', 'phone', 'email', 'status', 'category', 'total_received', 'account_balance', 'created_at'],
      properties: ['name', 'location', 'property_type', 'status', 'monthly_rent', 'total_units', 'occupied_units', 'created_at'],
      distributions: ['distribution_date', 'total_amount', 'status', 'distribution_month', 'beneficiaries_count', 'created_at'],
    };
  },

  async getTrialBalance(): Promise<{ account_code: string; account_name: string; debit: number; credit: number; balance: number }[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('code, name_ar, current_balance, account_nature')
      .eq('is_active', true)
      .order('code');
    
    if (error) {
      productionLogger.error('Error fetching trial balance:', error);
      return [];
    }
    
    return (data || []).map(account => {
      const balance = account.current_balance || 0;
      const isDebitNature = ['asset', 'expense'].includes(account.account_nature);
      
      return {
        account_code: account.code,
        account_name: account.name_ar,
        debit: isDebitNature && balance > 0 ? balance : (!isDebitNature && balance < 0 ? Math.abs(balance) : 0),
        credit: !isDebitNature && balance > 0 ? balance : (isDebitNature && balance < 0 ? Math.abs(balance) : 0),
        balance,
      };
    });
  },

  async getAgingReport() {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', 'unpaid')
      .order('due_date');
    
    if (error) {
      productionLogger.error('Error fetching aging report:', error);
      return { items: [], summary: { current: 0, '1-30': 0, '31-60': 0, '61-90': 0, 'over90': 0, total: 0 } };
    }
    
    const today = new Date();
    const summary = { current: 0, '1-30': 0, '31-60': 0, '61-90': 0, 'over90': 0, total: 0 };
    
    (data || []).forEach(invoice => {
      const dueDate = new Date(invoice.due_date);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const amount = invoice.total_amount || 0;
      
      summary.total += amount;
      
      if (daysOverdue <= 0) {
        summary.current += amount;
      } else if (daysOverdue <= 30) {
        summary['1-30'] += amount;
      } else if (daysOverdue <= 60) {
        summary['31-60'] += amount;
      } else if (daysOverdue <= 90) {
        summary['61-90'] += amount;
      } else {
        summary['over90'] += amount;
      }
    });
    
    return { items: data || [], summary };
  },
};

/**
 * Facade class for backward compatibility
 */
export class ReportService {
  // ==================== Template Methods ====================
  static createTemplate = ReportTemplateService.createTemplate;
  static getTemplates = ReportTemplateService.getTemplates;
  static generateReport = (templateId: string, customFilters?: ReportFilters) => 
    ReportTemplateService.generateReport(templateId, customFilters);
  static deleteTemplate = ReportTemplateService.deleteTemplate;
  static saveCustomReport = ReportTemplateService.saveCustomReport;
  static getScheduledReports = ReportTemplateService.getScheduledReports;

  // ==================== Disclosure Methods ====================
  static getLatestAnnualDisclosure = DisclosureService.getLatestAnnualDisclosure;
  static getAnnualDisclosures = DisclosureService.getAnnualDisclosures;
  static getCurrentYearDisclosure = DisclosureService.getCurrentYearDisclosure;
  static generateAnnualDisclosure = DisclosureService.generateAnnualDisclosure;
  static publishDisclosure = DisclosureService.publishDisclosure;
  static getDisclosureBeneficiaries = DisclosureService.getDisclosureBeneficiaries;
  static getDisclosureBeneficiariesForPDF = DisclosureService.getDisclosureBeneficiariesForPDF;

  // ==================== Financial Report Methods ====================
  static getAccountingLinkReport = FinancialReportService.getAccountingLinkReport;
  static getAgingReport = FinancialReportService.getAgingReport;
  static getBudgetVarianceReport = FinancialReportService.getBudgetVarianceReport;
  static getCashFlowReport = FinancialReportService.getCashFlowReport;
  static getCashFlowData = FinancialReportService.getCashFlowData;
  static getPropertiesReport = FinancialReportService.getPropertiesReport;
  static getLinkedOperations = FinancialReportService.getLinkedOperations;
  static getPropertiesWithContracts = FinancialReportService.getPropertiesWithContracts;
  
  static async getUnlinkedOperations(): Promise<OperationRecord[]> {
    // Get journal entries without linked operations
    const { data, error } = await supabase
      .from('journal_entries')
      .select('id, entry_number, entry_date, description, reference_type')
      .is('reference_type', null)
      .order('entry_date', { ascending: false })
      .limit(100);
    
    if (error) {
      productionLogger.error('Error fetching unlinked operations:', error);
      return [];
    }
    
    return (data || []).map(entry => ({
      id: entry.id,
      type: 'journal_entry',
      number: entry.entry_number || '',
      description: entry.description || '',
      amount: 0,
      date: entry.entry_date,
      journal_entry_id: entry.id,
    }));
  }

  // ==================== Analysis Methods ====================
  static getDistributionAnalysisReport = AnalysisService.getDistributionAnalysisReport;
  static getFundsPerformanceReport = AnalysisService.getFundsPerformanceReport;
  static getInteractiveDashboardData = AnalysisService.getInteractiveDashboardData;
  static getLoansAgingReport = AnalysisService.getLoansAgingReport;
  static getMaintenanceCostReport = AnalysisService.getMaintenanceCostReport;
  static getWaqfRevenue = AnalysisService.getWaqfRevenue;
}
