/**
 * أنواع التقارير
 */

import type { Json } from "@/integrations/supabase/types";

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

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  category?: string;
  [key: string]: Json | undefined;
}

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

export type ReportData = Record<string, unknown>;
