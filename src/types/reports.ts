/**
 * Types for Reports and Custom Report Builder
 */

export interface CustomReportFilter {
  field: string;
  operator: string;
  value: string | number | boolean;
}

export interface ReportTemplate {
  id: string;
  template_name: string;
  report_type: string;
  description?: string;
  template_config: Record<string, unknown>;
  created_at: string;
}

export interface ScheduledReport {
  id: string;
  template_id: string;
  report_name: string;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  schedule_config: Record<string, unknown>;
  delivery_method: 'email' | 'download' | 'both';
  recipients?: string[];
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
}

export interface DashboardWidget {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, unknown>;
}

export interface DashboardConfig {
  id?: string;
  dashboard_name: string;
  layout_config: DashboardWidget[];
  is_default: boolean;
  is_shared: boolean;
  created_at?: string;
}

export interface SimulationResult {
  distribution: Array<{
    beneficiary_id: string;
    beneficiary_name: string;
    category: string;
    allocated_amount: number;
  }>;
  totalAmount: number;
  breakdown: Record<string, number>;
}

export interface PaymentScheduleItem {
  payment_number: number;
  due_date: string;
  principal: number;
  interest: number;
  total_payment: number;
  remaining_balance: number;
}
