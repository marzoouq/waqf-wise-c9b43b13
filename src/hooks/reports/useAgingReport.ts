/**
 * useAgingReport Hook
 * Hook لتقرير أعمار الديون
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AgingItem {
  id: string;
  beneficiary_name: string;
  amount_due: number;
  due_date: string;
  daysPastDue: number;
  ageCategory: string;
}

export interface AgingSummary {
  current: number;
  '1-30': number;
  '30-60': number;
  '60-90': number;
  '90+': number;
  total: number;
}

export function useAgingReport() {
  const { data: agingData, isLoading, error } = useQuery({
    queryKey: ['aging_report'],
    queryFn: async () => {
      const { data: beneficiaries, error } = await supabase
        .from('beneficiaries')
        .select('id, full_name, account_balance, total_received')
        .gt('account_balance', 0)
        .order('account_balance', { ascending: false });

      if (error) throw error;

      return (beneficiaries || []).map((ben): AgingItem => {
        const balance = ben.account_balance || 0;
        let ageCategory = 'current';
        let daysPastDue = 0;

        if (balance > 50000) {
          ageCategory = '90+';
          daysPastDue = 120;
        } else if (balance > 30000) {
          ageCategory = '60-90';
          daysPastDue = 75;
        } else if (balance > 15000) {
          ageCategory = '30-60';
          daysPastDue = 45;
        } else if (balance > 5000) {
          ageCategory = '1-30';
          daysPastDue = 15;
        }

        return {
          id: ben.id,
          beneficiary_name: ben.full_name,
          amount_due: balance,
          due_date: new Date().toISOString(),
          daysPastDue,
          ageCategory,
        };
      });
    },
  });

  const summary = agingData?.reduce<AgingSummary>(
    (acc, item) => {
      const category = item.ageCategory as keyof AgingSummary;
      if (category !== 'total') {
        acc[category] = (acc[category] || 0) + item.amount_due;
      }
      acc.total += item.amount_due;
      return acc;
    },
    { current: 0, '1-30': 0, '30-60': 0, '60-90': 0, '90+': 0, total: 0 }
  );

  return {
    agingData,
    summary,
    isLoading,
    error,
  };
}
