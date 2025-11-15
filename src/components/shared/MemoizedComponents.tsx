/**
 * مكونات محسّنة مع React.memo لتحسين الأداء
 * تمنع إعادة الرسم غير الضرورية
 */

import { memo } from 'react';
import FinancialStats from '@/components/dashboard/FinancialStats';
import RevenueExpenseChart from '@/components/dashboard/RevenueExpenseChart';
import AccountDistributionChart from '@/components/dashboard/AccountDistributionChart';
import BudgetComparisonChart from '@/components/dashboard/BudgetComparisonChart';
import AccountingStats from '@/components/dashboard/AccountingStats';
import RecentJournalEntries from '@/components/dashboard/RecentJournalEntries';
import FamiliesStats from '@/components/dashboard/FamiliesStats';
import RequestsStats from '@/components/dashboard/RequestsStats';
import { TrialBalanceReport } from '@/components/accounting/TrialBalanceReport';
import { EnhancedIncomeStatement } from '@/components/accounting/EnhancedIncomeStatement';
import { EnhancedBalanceSheet } from '@/components/accounting/EnhancedBalanceSheet';
import { CashFlowStatement } from '@/components/accounting/CashFlowStatement';

// Dashboard Components مع memo
export const MemoizedFinancialStats = memo(FinancialStats);
export const MemoizedRevenueExpenseChart = memo(RevenueExpenseChart);
export const MemoizedAccountDistributionChart = memo(AccountDistributionChart);
export const MemoizedBudgetComparisonChart = memo(BudgetComparisonChart);
export const MemoizedAccountingStats = memo(AccountingStats);
export const MemoizedRecentJournalEntries = memo(RecentJournalEntries);
export const MemoizedFamiliesStats = memo(FamiliesStats);
export const MemoizedRequestsStats = memo(RequestsStats);

// Accounting Reports مع memo
export const MemoizedTrialBalanceReport = memo(TrialBalanceReport);
export const MemoizedIncomeStatement = memo(EnhancedIncomeStatement);
export const MemoizedBalanceSheet = memo(EnhancedBalanceSheet);
export const MemoizedCashFlowStatement = memo(CashFlowStatement);

// Table Row مع memo - للجداول الكبيرة
export const MemoizedTableRow = memo(({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
});

// Card Component مع memo
export const MemoizedCard = memo(({ 
  title, 
  children 
}: { 
  title: string; 
  children: React.ReactNode;
}) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
});
