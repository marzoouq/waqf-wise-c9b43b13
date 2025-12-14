/**
 * useAgingReport Hook
 * Hook لتقرير أعمار الديون
 * @version 2.8.68
 */
import { useQuery } from '@tanstack/react-query';
import { CustomReportsService } from '@/services';

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
  const { data: agingResult, isLoading, error, refetch } = useQuery({
    queryKey: ['aging_report'],
    queryFn: () => CustomReportsService.getAgingReport(),
  });

  // استخراج البيانات من النتيجة
  const agingData = agingResult?.items || [];

  const summary = agingData.reduce<AgingSummary>(
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
    refetch,
  };
}
