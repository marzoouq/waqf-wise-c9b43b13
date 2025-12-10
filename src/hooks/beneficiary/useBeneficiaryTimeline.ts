/**
 * Hook لجلب بيانات الخط الزمني للمستفيد
 * @version 2.8.60
 */

import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/query-keys';
import { BeneficiaryService } from '@/services';

export interface TimelineEvent {
  id: string;
  type: 'payment' | 'request' | 'update' | 'status_change';
  title: string;
  description: string;
  date: string;
  status?: string;
  amount?: number;
}

export function useBeneficiaryTimeline(beneficiaryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_TIMELINE(beneficiaryId),
    queryFn: async (): Promise<TimelineEvent[]> => {
      return BeneficiaryService.getTimeline(beneficiaryId);
    },
    staleTime: 60 * 1000,
    enabled: !!beneficiaryId,
  });
}
