/**
 * أنواع نظام التقارير - موحد
 * يجمع بين report.ts و reports.ts و reports.types.ts
 */

import type { Json } from "@/integrations/supabase/types";

// ====================
// أنواع بيانات التقارير (من reports.types.ts)
// ====================

export interface BeneficiaryReportData {
  id: string;
  full_name: string;
  national_id: string;
  phone: string;
  email?: string | null;
  category: string;
  status: string;
  tribe?: string | null;
  beneficiary_type?: string | null;
  city?: string | null;
  total_received?: number | null;
  created_at: string;
}

export interface DistributionReportData {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at?: string | null;
  executed_at?: string | null;
  approved_at?: string | null;
  distribution_details?: Array<{ beneficiary_id: string }>;
}

export interface CategoryDataItem {
  name: string;
  count: number;
  amount: number;
}

export interface TribeDataItem {
  name: string;
  count: number;
}

export interface TypeDataItem {
  name: string;
  value: number;
}

export interface CityDataItem {
  city: string;
  count: number;
}

export interface MonthlyEfficiencyData {
  month: string;
  onTime: number;
  delayed: number;
  avgApprovalTime: number;
  count: number;
}

export interface FinancialRatioKPI {
  id: string;
  kpi_name: string;
  kpi_value: number;
  kpi_target?: number;
  created_at: string;
}

export interface SavedSearchData {
  id: string;
  search_name: string;
  search_criteria: Record<string, unknown>;
  created_at: string;
  usage_count?: number;
}

// ====================
// أنواع الفلاتر
// ====================

export type ReportFilterValue = string | number | boolean | Date | [number, number] | [Date, Date] | null;

export type ReportFilterOperator = 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';

export interface ReportFilter {
  field: string;
  operator: ReportFilterOperator;
  value: ReportFilterValue;
}

export interface CustomReportFilter {
  field: string;
  operator: ReportFilterOperator;
  value: ReportFilterValue;
}

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  category?: string;
  [key: string]: Json | undefined;
}

// ====================
// أنواع الأعمدة
// ====================

export type ReportColumnType = 'text' | 'number' | 'date' | 'currency';

export type ReportAggregateType = 'sum' | 'avg' | 'count' | 'min' | 'max';

export interface ReportColumn {
  key: string;
  label: string;
  type: ReportColumnType;
  aggregate?: ReportAggregateType;
}

// ====================
// أنواع إعدادات القالب
// ====================

export interface ReportTemplateConfig {
  layout?: string;
  columns?: string[];
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  pageSize?: number;
  showTotals?: boolean;
  [key: string]: Json | undefined;
}

// ====================
// أنواع قوالب التقارير
// ====================

export interface ReportTemplate {
  id?: string;
  template_name: string;
  report_type: string;
  description?: string;
  template_config?: Json;
  filters?: Json;
  columns?: Json;
  is_public?: boolean;
}

// ====================
// أنواع التقارير المخصصة
// ====================

export interface CustomReport {
  id: string;
  name: string;
  description?: string;
  report_type: string;
  data_source: string;
  columns: ReportColumn[];
  filters: CustomReportFilter[];
  created_at: string;
  updated_at: string;
}

// ====================
// أنواع بيانات التقارير
// ====================

export type ReportData = Record<string, unknown>;

export interface ReportResult {
  data: ReportData[];
  totalCount: number;
  summary?: Record<string, number>;
}

// ====================
// أنواع التصدير
// ====================

export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface ReportExportOptions {
  format: ExportFormat;
  fileName?: string;
  includeHeaders?: boolean;
  includeSummary?: boolean;
}
