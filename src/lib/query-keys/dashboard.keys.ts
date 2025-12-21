/**
 * Dashboard Query Keys - مفاتيح استعلامات لوحات التحكم
 */

export const DASHBOARD_KEYS = {
  // Dashboard KPIs
  UNIFIED_KPIS: ['unified-dashboard-kpis'] as const,
  NAZER_KPIS: ['nazer-kpis'] as const,
  NAZER_SYSTEM_OVERVIEW: ['nazer-system-overview'] as const,
  NAZER_BENEFICIARIES_QUICK: ['nazer-beneficiaries-quick'] as const,
  ADMIN_KPIS: ['admin-kpis'] as const,
  ACCOUNTANT_KPIS: ['accountant-kpis'] as const,
  CASHIER_KPIS: ['cashier-kpis'] as const,
  CASHIER_STATS: ['cashier-stats'] as const,
  KPIS: (category?: string) => ['kpis', category] as const,
  DASHBOARD_KPIS: ['dashboard-kpis'] as const,
  
  // Dashboard Data
  DASHBOARD_BENEFICIARIES: (timeRange?: string) => ['dashboard-beneficiaries', timeRange] as const,
  DASHBOARD_PAYMENTS: (timeRange?: string) => ['dashboard-payments', timeRange] as const,
  DASHBOARD_PROPERTIES: ['dashboard-properties'] as const,
  DASHBOARD_CONFIGS: ['dashboard-configs'] as const,

  // Charts
  BUDGET_COMPARISON_CHART: ['budget-comparison-chart'] as const,
  REVENUE_EXPENSE_CHART: ['revenue-expense-chart'] as const,
  REVENUE_DISTRIBUTION: ['revenue-distribution'] as const,
  REVENUE_PROGRESS: (fiscalYearId?: string) => ['revenue-progress', fiscalYearId] as const,
  DISTRIBUTION_PIE_CHART: ['distribution-pie-chart'] as const,
  MONTHLY_REVENUE_CHART: ['monthly-revenue-chart'] as const,
  VOUCHERS_STATS: ['vouchers-stats'] as const,

  // AI Insights
  AI_INSIGHTS: ['ai-insights'] as const,
  SMART_ALERTS: ['smart-alerts'] as const,
  ADMIN_ALERTS: ['admin-alerts'] as const,
  
  // Performance
  PERFORMANCE_METRICS_DATA: ['performance-metrics-data'] as const,
} as const;
