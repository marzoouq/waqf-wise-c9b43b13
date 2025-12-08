/**
 * Hook لجلب بيانات التقارير المالية
 * Financial Reports Data Hook
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TrialBalanceItem, AccountWithBalance } from '@/types/accounting';

export function useFinancialReportsData() {
  // ميزان المراجعة
  const { data: trialBalance = [], isLoading: loadingTrial } = useQuery({
    queryKey: ['trial-balance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trial_balance')
        .select('code, name_ar, total_debit, total_credit, balance');
      if (error) throw error;
      return (data || []) as TrialBalanceItem[];
    },
  });

  // قائمة الدخل - الحسابات
  const { data: accounts = [], isLoading: loadingIncome } = useQuery({
    queryKey: ['accounts-with-balances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('id, code, name_ar, account_type, account_nature, current_balance')
        .in('account_type', ['revenue', 'expense'])
        .eq('is_active', true);
      
      if (error) throw error;
      return (data || []) as AccountWithBalance[];
    },
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
    trialBalance,
    accounts,
    totalRevenue,
    totalExpense,
    netIncome,
    isLoading: loadingTrial || loadingIncome,
  };
}
