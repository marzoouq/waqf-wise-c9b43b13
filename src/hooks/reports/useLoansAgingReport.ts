/**
 * useLoansAgingReport Hook
 * Hook لتقرير أعمار ديون القروض
 */
import { useQuery } from '@tanstack/react-query';
import { LoansService } from '@/services/loans.service';
import { QUERY_KEYS } from '@/lib/query-keys';

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
    queryKey: QUERY_KEYS.LOANS_AGING,
    queryFn: () => LoansService.getAgingReport(),
  });

  const { data: agingByCategory } = useQuery({
    queryKey: QUERY_KEYS.LOANS_AGING_CATEGORIES(agingData),
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
