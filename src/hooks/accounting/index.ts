/**
 * Accounting Hooks - خطافات المحاسبة
 * @version 2.8.1
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

// ==================== Dialog Hooks ====================
export { useAddAccount } from './useAddAccount';
export { useAddJournalEntry, type EntryLine } from './useAddJournalEntry';
export { useApprovalWorkflow, type ApprovalStatus, type ApprovalStep } from './useApprovalWorkflow';
export { useApproveJournal } from './useApproveJournal';

// ==================== Component Hooks (New) ====================
export { useBudgetManagement, type BudgetData } from './useBudgetManagement';
export { useCashFlowCalculation } from './useCashFlowCalculation';
export { useGeneralLedger } from './useGeneralLedger';
export { useInvoiceManagement, type Invoice } from './useInvoiceManagement';
export { useJournalEntriesList, type JournalEntry } from './useJournalEntriesList';
export { useViewJournalEntry } from './useViewJournalEntry';
