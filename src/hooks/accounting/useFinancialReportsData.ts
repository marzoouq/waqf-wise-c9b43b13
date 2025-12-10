/**
 * Hook لجلب بيانات التقارير المالية
 * Financial Reports Data Hook
 * @version 2.8.68
 */

import { useQuery } from '@tanstack/react-query';
import { ReportsService } from '@/services';
import type { TrialBalanceItem, AccountWithBalance } from '@/types/accounting';
import { QUERY_KEYS } from '@/lib/query-keys';

export function useFinancialReportsData() {
  // ميزان المراجعة
  const { data: trialBalance = [], isLoading: loadingTrial } = useQuery({
    queryKey: QUERY_KEYS.TRIAL_BALANCE,
    queryFn: () => ReportsService.getTrialBalance(),
  });

  // قائمة الدخل - الحسابات
  const { data: accounts = [], isLoading: loadingIncome } = useQuery({
    queryKey: QUERY_KEYS.ACCOUNTS_WITH_BALANCES,
    queryFn: () => ReportsService.getIncomeExpenseAccounts(),
  });

  // حسابات الإيرادات والمصروفات
  const totalRevenue = accounts
    .filter(acc => acc.account_type === 'revenue')
    .reduce((sum, acc) => sum + (acc.current_balance || 0), 0);

  const totalExpense = accounts
    .filter(acc => acc.account_type === 'expense')
    .reduce((sum, acc) => sum + (acc.current_balance || 0), 0);

  const netIncome = totalRevenue - totalExpense;

  return {
    trialBalance: trialBalance as TrialBalanceItem[],
    accounts: accounts as AccountWithBalance[],
    totalRevenue,
    totalExpense,
    netIncome,
    isLoading: loadingTrial || loadingIncome,
  };
}
