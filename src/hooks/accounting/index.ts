/**
 * Accounting Hooks - خطافات المحاسبة
 * @version 2.6.33
 */

// ==================== Dashboard Hooks ====================
export { useAccountantKPIs, type AccountantKPIs } from './useAccountantKPIs';
export { useAccountantDashboardData } from './useAccountantDashboardData';

// ==================== Core Hooks ====================
export { useAccounts } from './useAccounts';
export { useJournalEntries } from './useJournalEntries';
export { useBudgets, type Budget } from './useBudgets';
export { useFiscalYears, type FiscalYear } from './useFiscalYears';
export { useFiscalYearClosings } from './useFiscalYearClosings';
export { useAutoJournalTemplates } from './useAutoJournalTemplates';
export { useCashFlows } from './useCashFlows';
export { useFinancialAnalytics } from './useFinancialAnalytics';
export { useFinancialData } from './useFinancialData';
export { useFinancialReports } from './useFinancialReports';
export { useAccountingFilters } from './useAccountingFilters';
export { useAccountingTabs } from './useAccountingTabs';
export { useFinancialReportsData } from './useFinancialReportsData';
export { useJournalEntryForm, type JournalLine } from './useJournalEntryForm';
