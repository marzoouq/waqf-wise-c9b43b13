/**
 * Dashboard Service - خدمة لوحة التحكم (Facade)
 * @version 2.8.84
 * 
 * هذا الملف يعمل كـ Facade للتوافق مع الكود القديم
 * الخدمات الفعلية موجودة في مجلد dashboard/
 */

import { 
  KPIService, 
  FinancialCardsService, 
  ChartsService, 
  DashboardConfigService,
  type DashboardKPIs,
  type SystemOverviewStats,
  type UnifiedKPIsData,
  type BankBalanceData,
  type FiscalYearCorpus,
  type BudgetComparisonItem,
  type MonthlyChartData,
} from './dashboard/index';
import type { Json } from "@/integrations/supabase/types";

// Re-export types
export type { 
  DashboardKPIs, 
  SystemOverviewStats, 
  UnifiedKPIsData, 
  BankBalanceData, 
  FiscalYearCorpus,
  BudgetComparisonItem,
  MonthlyChartData,
};

/**
 * Facade object for backward compatibility
 */
export const DashboardService = {
  // ==================== KPI Methods ====================
  getSystemOverview: KPIService.getSystemOverview,
  getUnifiedKPIs: KPIService.getUnifiedKPIs,
  getDashboardKPIs: KPIService.getDashboardKPIs,
  getKPIDefinitions: KPIService.getKPIDefinitions,
  calculateKPIValue: KPIService.calculateKPIValue,

  // ==================== Financial Cards Methods ====================
  getBankBalance: FinancialCardsService.getBankBalance,
  getWaqfCorpus: FinancialCardsService.getWaqfCorpus,
  getRevenueProgress: FinancialCardsService.getRevenueProgress,
  getWaqfSummary: FinancialCardsService.getWaqfSummary,

  // ==================== Charts Methods ====================
  getPropertiesPerformance: ChartsService.getPropertiesPerformance,
  getRevenueDistribution: ChartsService.getRevenueDistribution,
  getBudgetComparison: ChartsService.getBudgetComparison,
  getRevenueExpenseChartData: ChartsService.getRevenueExpenseChartData,

  // ==================== Config Methods ====================
  getDashboardConfigs: DashboardConfigService.getDashboardConfigs,
  saveDashboardConfig: (config: { dashboard_name: string; layout_config: Json; is_default: boolean; is_shared: boolean }) => 
    DashboardConfigService.saveDashboardConfig(config),
  updateDashboardConfig: DashboardConfigService.updateDashboardConfig,
  deleteDashboardConfig: DashboardConfigService.deleteDashboardConfig,
};
