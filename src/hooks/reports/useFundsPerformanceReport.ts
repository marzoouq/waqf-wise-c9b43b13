/**
 * useFundsPerformanceReport Hook
 * Hook لتقرير أداء المصارف
 */
import { useQuery } from '@tanstack/react-query';
import { FundService } from '@/services';

export interface FundPerformance {
  fund_id: string;
  fund_name: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  beneficiaries_count: number;
  utilization_rate: number;
  avg_per_beneficiary: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  count: number;
}

export function useFundsPerformanceReport() {
  const { data: fundPerformance, isLoading, error } = useQuery<FundPerformance[]>({
    queryKey: ['funds-performance'],
    queryFn: async () => {
      const funds = await FundService.getAll();
      
      return (funds || [])
        .filter(fund => fund.is_active)
        .map(fund => ({
          fund_id: fund.id,
          fund_name: fund.name,
          category: fund.category,
          allocated_amount: Number(fund.allocated_amount),
          spent_amount: Number(fund.spent_amount),
          beneficiaries_count: fund.beneficiaries_count,
          utilization_rate: Number(fund.allocated_amount) > 0 
            ? (Number(fund.spent_amount) / Number(fund.allocated_amount)) * 100 
            : 0,
          avg_per_beneficiary: fund.beneficiaries_count > 0 
            ? Number(fund.spent_amount) / fund.beneficiaries_count 
            : 0
        }))
        .sort((a, b) => b.spent_amount - a.spent_amount);
    },
  });

  const { data: categoryDistribution } = useQuery({
    queryKey: ['funds-category-distribution', fundPerformance],
    queryFn: async (): Promise<CategoryDistribution[]> => {
      if (!fundPerformance) return [];

      const categories = fundPerformance.reduce((acc, fund) => {
        if (!acc[fund.category]) {
          acc[fund.category] = { name: fund.category, value: 0, count: 0 };
        }
        acc[fund.category].value += fund.spent_amount;
        acc[fund.category].count += 1;
        return acc;
      }, {} as Record<string, CategoryDistribution>);

      return Object.values(categories);
    },
    enabled: !!fundPerformance,
  });

  const totals = fundPerformance ? {
    totalAllocated: fundPerformance.reduce((sum, f) => sum + f.allocated_amount, 0),
    totalSpent: fundPerformance.reduce((sum, f) => sum + f.spent_amount, 0),
    overallUtilization: 0,
  } : { totalAllocated: 0, totalSpent: 0, overallUtilization: 0 };

  if (totals.totalAllocated > 0) {
    totals.overallUtilization = (totals.totalSpent / totals.totalAllocated) * 100;
  }

  return {
    fundPerformance,
    categoryDistribution,
    totals,
    isLoading,
    error,
  };
}
