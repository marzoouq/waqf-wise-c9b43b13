/**
 * أنواع بيانات التقارير
 */

// أنواع تقرير توزيع المستفيدين
export interface BeneficiaryReportData {
  id: string;
  full_name: string;
  national_id: string;
  category: string;
  status: string;
  tribe?: string | null;
  beneficiary_type?: string | null;
  city?: string | null;
  total_received?: number | null;
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

// أنواع مخططات التقارير
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

// أنواع تقرير كفاءة التوزيع
export interface MonthlyEfficiencyData {
  month: string;
  onTime: number;
  delayed: number;
  avgApprovalTime: number;
  count: number;
}

// أنواع النسب المالية
export interface FinancialRatioKPI {
  kpi_name: string;
  kpi_value: number;
  kpi_target?: number;
  created_at: string;
}

// أنواع البحث المحفوظ
export interface SavedSearchData {
  id: string;
  search_name: string;
  search_criteria: Record<string, unknown>;
  created_at: string;
  usage_count?: number;
}
