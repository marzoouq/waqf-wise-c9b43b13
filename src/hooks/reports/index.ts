/**
 * Reports Hooks - خطافات التقارير
 * @version 2.7.8
 */

export { useReports } from './useReports';
export { useCustomReports, type ReportConfig, type ReportTemplate, type ReportResult } from './useCustomReports';
export { useScheduledReports, useCreateScheduledReport, useUpdateScheduledReport, useDeleteScheduledReport, useTriggerScheduledReport, type ScheduledReport } from './useScheduledReports';
export { useAnnualDisclosures } from './useAnnualDisclosures';
export { useBeneficiaryReportsData } from './useBeneficiaryReportsData';
export { useWaqfRevenueByFiscalYear, type WaqfRevenueData } from './useWaqfRevenueByFiscalYear';

// تقارير جديدة - v2.7.8
export { useAgingReport, type AgingItem, type AgingSummary } from './useAgingReport';
export { useLoansAgingReport, type LoanAgingData, type AgingCategoryData } from './useLoansAgingReport';
export { useFundsPerformanceReport, type FundPerformance, type CategoryDistribution } from './useFundsPerformanceReport';
export { useMaintenanceCostReport, type MaintenanceCostData, type MaintenanceTypeData } from './useMaintenanceCostReport';
export { useDistributionAnalysisReport, type DistributionTrendData, type StatusStatData } from './useDistributionAnalysisReport';
export { useBudgetVarianceReport, type BudgetData, type BudgetSummary } from './useBudgetVarianceReport';
export { useDetailedGeneralLedger, type LedgerEntry } from './useDetailedGeneralLedger';
