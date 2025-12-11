/**
 * Dashboard Services Index
 * تصدير جميع خدمات لوحة التحكم
 */

export { KPIService, type DashboardKPIs, type SystemOverviewStats, type UnifiedKPIsData } from './kpi.service';
export { FinancialCardsService, type BankBalanceData, type FiscalYearCorpus } from './financial-cards.service';
export { ChartsService, type BudgetComparisonItem, type MonthlyChartData } from './charts.service';
export { DashboardConfigService } from './config.service';
