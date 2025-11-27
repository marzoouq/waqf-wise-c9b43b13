/**
 * أنواع التقارير المتقدمة والذكاء التجاري
 */

import type { Database } from '@/integrations/supabase/types';

// Types from database
export type ReportTemplate = Database['public']['Tables']['report_templates']['Row'];
export type ReportTemplateInsert = Database['public']['Tables']['report_templates']['Insert'];
export type KPIDefinition = Database['public']['Tables']['kpi_definitions']['Row'];
export type ScheduledReport = Database['public']['Tables']['scheduled_reports']['Row'];

// Dashboard types (new tables)
export interface Dashboard {
  id: string;
  dashboard_name: string;
  dashboard_name_ar: string | null;
  description: string | null;
  layout_config: Record<string, unknown>;
  is_default: boolean;
  is_system: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardWidget {
  id: string;
  dashboard_id: string | null;
  widget_name: string;
  widget_name_ar: string | null;
  widget_type: WidgetType;
  data_source: string | null;
  config: WidgetConfig;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  is_visible: boolean;
  refresh_interval: number | null;
  created_at: string;
  updated_at: string;
}

export interface KPIValue {
  id: string;
  kpi_id: string | null;
  value: number;
  previous_value: number | null;
  change_percentage: number | null;
  recorded_at: string;
  period_start: string | null;
  period_end: string | null;
  metadata: Record<string, unknown>;
}

export interface SavedReport {
  id: string;
  user_id: string | null;
  report_name: string;
  report_template_id: string | null;
  filters: Record<string, unknown>;
  columns: string[];
  sort_config: Record<string, unknown>;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportExecutionLog {
  id: string;
  scheduled_report_id: string | null;
  report_template_id: string | null;
  execution_type: 'scheduled' | 'manual';
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at: string | null;
  file_path: string | null;
  file_size: number | null;
  row_count: number | null;
  error_message: string | null;
  executed_by: string | null;
  metadata: Record<string, unknown>;
}

// Widget types
export type WidgetType = 'chart' | 'kpi' | 'table' | 'list' | 'stat' | 'gauge' | 'trend';

export interface WidgetConfig {
  title?: string;
  subtitle?: string;
  chartType?: 'bar' | 'line' | 'pie' | 'area' | 'donut';
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  dataKey?: string;
  valueKey?: string;
  labelKey?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min';
  timeRange?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  filters?: Record<string, unknown>;
}

// KPI with calculated values
export interface KPIWithValue extends KPIDefinition {
  current_value?: number;
  previous_value?: number;
  change_percentage?: number;
  status: 'success' | 'warning' | 'danger' | 'neutral';
  trend: 'up' | 'down' | 'stable';
}

// Report builder types
export interface ReportColumn {
  id: string;
  field: string;
  header: string;
  header_ar?: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'boolean' | 'percentage';
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  aggregatable?: boolean;
  format?: string;
}

export interface ReportFilter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: unknown;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean';
}

export type FilterOperator = 
  | 'eq' | 'neq' 
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'contains' | 'starts_with' | 'ends_with'
  | 'in' | 'not_in'
  | 'is_null' | 'is_not_null'
  | 'between';

export interface ReportSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ReportGrouping {
  field: string;
  aggregations: {
    field: string;
    type: 'sum' | 'avg' | 'count' | 'max' | 'min';
  }[];
}

// Schedule types
export interface ScheduleConfig {
  time: string; // HH:mm
  timezone: string;
  day_of_week?: number; // 0-6 for weekly
  day_of_month?: number; // 1-31 for monthly
  month_of_year?: number; // 1-12 for yearly
}

// Export types
export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  includeHeaders: boolean;
  includeFilters: boolean;
  includeSummary: boolean;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'A3' | 'Letter';
}
