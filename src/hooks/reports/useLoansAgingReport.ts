/**
 * useLoansAgingReport Hook
 * Hook لتقرير أعمار ديون القروض
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LoanAgingData {
  loan_id: string;
  loan_number: string;
  beneficiary_name: string;
  principal_amount: number;
  total_paid: number;
  remaining_balance: number;
  days_overdue: number;
  aging_category: string;
}

export interface AgingCategoryData {
  category: string;
  count: number;
  amount: number;
}

export function useLoansAgingReport() {
  const { data: agingData, isLoading, error } = useQuery<LoanAgingData[]>({
    queryKey: ['loans-aging'],
    queryFn: async () => {
      const { data: loans, error } = await supabase
        .from('loans')
        .select(`
          id,
          loan_number,
          loan_amount,
          start_date,
          status,
          beneficiaries!inner(full_name)
        `)
        .in('status', ['active', 'defaulted']);
      
      if (error) throw error;

      return (loans || []).map((loan) => {
        const totalPaid = 0;
        const remainingBalance = Number(loan.loan_amount) - totalPaid;
        const daysOverdue = 0;
        
        let agingCategory = 'حديث (0-30 يوم)';
        if (daysOverdue > 90) agingCategory = 'خطير (90+ يوم)';
        else if (daysOverdue > 60) agingCategory = 'متأخر جداً (60-90 يوم)';
        else if (daysOverdue > 30) agingCategory = 'متأخر (30-60 يوم)';

        const beneficiaryData = loan.beneficiaries as unknown as { full_name: string };

        return {
          loan_id: loan.id,
          loan_number: loan.loan_number,
          beneficiary_name: beneficiaryData?.full_name || 'غير محدد',
          principal_amount: Number(loan.loan_amount),
          total_paid: totalPaid,
          remaining_balance: remainingBalance,
          days_overdue: daysOverdue,
          aging_category: agingCategory,
        };
      }).sort((a, b) => b.days_overdue - a.days_overdue);
    },
  });

  const { data: agingByCategory } = useQuery({
    queryKey: ['loans-aging-categories', agingData],
    queryFn: async (): Promise<AgingCategoryData[]> => {
      if (!agingData) return [];

      const categories = agingData.reduce((acc, loan) => {
        if (!acc[loan.aging_category]) {
          acc[loan.aging_category] = { category: loan.aging_category, count: 0, amount: 0 };
        }
        acc[loan.aging_category].count += 1;
        acc[loan.aging_category].amount += loan.remaining_balance;
        return acc;
      }, {} as Record<string, AgingCategoryData>);

      return Object.values(categories);
    },
    enabled: !!agingData,
  });

  return {
    agingData,
    agingByCategory,
    isLoading,
    error,
  };
}
