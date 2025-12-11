/**
 * Report Service - خدمة التقارير (Facade)
 * @version 2.8.84
 * 
 * هذا الملف يعمل كـ Facade للتوافق مع الكود القديم
 * الخدمات الفعلية موجودة في مجلد report/
 */

import { 
  ReportTemplateService, 
  DisclosureService, 
  FinancialReportService, 
  AnalysisService,
  type CashFlowData,
  type PropertyWithContracts,
  type OperationRecord,
} from './report/index';
import type { ReportTemplate, ReportFilters } from "@/types/reports/index";
import { supabase } from "@/integrations/supabase/client";

// Re-export types
export type { ReportTemplate, CashFlowData, PropertyWithContracts, OperationRecord };

// Custom Reports Types
export interface CustomReportTemplate {
  id: string;
  name: string;
  report_type: string;
  fields: string[];
  filters?: Record<string, unknown>;
  sort_by?: string;
  is_favorite?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface ReportResult {
  data: Record<string, unknown>[];
  total: number;
}

export interface ReportConfig {
  type: string;
  fields: string[];
  sortBy?: string;
}

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
    return (data || []).map(t => ({
      id: t.id,
      name: t.template_name,
      report_type: t.report_type,
      fields: t.columns || [],
      is_favorite: false,
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
    return { id: data.id, name: data.template_name, report_type: data.report_type, fields: data.columns || [] };
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
  },

  async toggleFavorite(_id: string, _isFavorite: boolean): Promise<void> {
    // Not implemented - favorites stored locally
  },

  async executeReport(_template: CustomReportTemplate): Promise<ReportResult> {
    return { data: [], total: 0 };
  },

  async executeDirectReport(_reportType: string, _selectedFields: string[], _sortBy?: string): Promise<ReportResult> {
    return { data: [], total: 0 };
  },

  getReportFields() {
    return {
      beneficiaries: ['full_name', 'national_id', 'phone', 'status', 'category'],
      properties: ['name', 'location', 'status', 'monthly_rent'],
      distributions: ['distribution_date', 'total_amount', 'status'],
    };
  },

  async getTrialBalance() {
    return [];
  },

  async getAgingReport() {
    return { items: [], summary: { current: 0, '1-30': 0, '31-60': 0, '61-90': 0, 'over90': 0, total: 0 } };
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
    return [];
  }

  // ==================== Analysis Methods ====================
  static getDistributionAnalysisReport = AnalysisService.getDistributionAnalysisReport;
  static getFundsPerformanceReport = AnalysisService.getFundsPerformanceReport;
  static getInteractiveDashboardData = AnalysisService.getInteractiveDashboardData;
  static getLoansAgingReport = AnalysisService.getLoansAgingReport;
  static getMaintenanceCostReport = AnalysisService.getMaintenanceCostReport;
  static getWaqfRevenue = AnalysisService.getWaqfRevenue;
}
