/**
 * Hook لجلب بيانات التقارير المالية
 * Financial Reports Data Hook
 * @version 2.8.85
 */

import { useQuery } from '@tanstack/react-query';
import { AccountingService } from '@/services';
import type { TrialBalanceItem, AccountWithBalance } from '@/types/accounting';
import { QUERY_KEYS } from '@/lib/query-keys';

export function useFinancialReportsData() {
  // ميزان المراجعة
  const { data: trialBalanceRaw = [], isLoading: loadingTrial, error: trialError, refetch: refetchTrial } = useQuery({
    queryKey: QUERY_KEYS.TRIAL_BALANCE,
    queryFn: () => AccountingService.getTrialBalanceSimple(),
  });

  // تحويل البيانات للنوع المطلوب
  const trialBalance: TrialBalanceItem[] = trialBalanceRaw.map(item => ({
    code: item.code,
    name_ar: item.name,
    account_type: '',
    total_debit: item.debit,
    total_credit: item.credit,
    balance: item.balance,
  }));

  // قائمة الدخل - الحسابات
  const { data: accounts = [], isLoading: loadingIncome, error: incomeError, refetch: refetchIncome } = useQuery<AccountWithBalance[]>({
    queryKey: QUERY_KEYS.ACCOUNTS_WITH_BALANCES,
    queryFn: () => AccountingService.getRevenueAccounts(),
  });

  // حسابات الإيرادات والمصروفات
  const totalRevenue = accounts
    .filter(acc => acc.account_type === 'revenue')
    .reduce((sum, acc) => sum + (acc.current_balance || 0), 0);

  const totalExpense = accounts
    .filter(acc => acc.account_type === 'expense')
    .reduce((sum, acc) => sum + (acc.current_balance || 0), 0);

  const netIncome = totalRevenue - totalExpense;

  const refetch = () => {
    refetchTrial();
    refetchIncome();
  };

  return {
    trialBalance,
    accounts,
    totalRevenue,
    totalExpense,
    netIncome,
    isLoading: loadingTrial || loadingIncome,
    error: trialError || incomeError,
    refetch,
  };
}
