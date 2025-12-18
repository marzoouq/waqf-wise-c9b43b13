/**
 * useAgingReport Hook
 * Hook لتقرير أعمار الديون
 * @version 2.9.69
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

function getAgeCategory(daysPastDue: number): string {
  if (daysPastDue <= 0) return 'current';
  if (daysPastDue <= 30) return '1-30';
  if (daysPastDue <= 60) return '30-60';
  if (daysPastDue <= 90) return '60-90';
  return '90+';
}

export function useAgingReport() {
  const { data: agingResult, isLoading, error, refetch } = useQuery({
    queryKey: ['aging_report'],
    queryFn: () => CustomReportsService.getAgingReport(),
  });

  // تحويل البيانات الخام إلى الشكل المتوقع
  const rawItems = agingResult?.items || [];
  const today = new Date();
  
  const agingData: AgingItem[] = rawItems.map((item) => {
    const dueDate = new Date(item.due_date);
    const daysPastDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      id: item.id,
      beneficiary_name: item.customer_name || 'غير معروف',
      amount_due: item.total_amount || 0,
      due_date: item.due_date,
      daysPastDue,
      ageCategory: getAgeCategory(daysPastDue),
    };
  });

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
