/**
 * Hook لجلب بيانات الخط الزمني للمستفيد
 * @version 2.8.55
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_KEYS } from '@/lib/query-keys';

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
      const timelineEvents: TimelineEvent[] = [];

      const [paymentsRes, requestsRes, activitiesRes] = await Promise.all([
        supabase.from('payments').select('id, amount, description, payment_date')
          .eq('beneficiary_id', beneficiaryId).order('payment_date', { ascending: false }).limit(10),
        supabase.from('beneficiary_requests').select('*, request_types(name_ar)')
          .eq('beneficiary_id', beneficiaryId).order('created_at', { ascending: false }).limit(10),
        supabase.from('beneficiary_activity_log').select('id, action_type, action_description, created_at')
          .eq('beneficiary_id', beneficiaryId).order('created_at', { ascending: false }).limit(10),
      ]);

      paymentsRes.data?.forEach(p => timelineEvents.push({ id: p.id, type: 'payment', title: 'دفعة مالية', description: p.description || 'دفعة من الوقف', date: p.payment_date, amount: p.amount }));
      requestsRes.data?.forEach((r: any) => timelineEvents.push({ id: r.id, type: 'request', title: r.request_types?.name_ar || 'طلب جديد', description: r.description, date: r.created_at || '', status: r.status || undefined }));
      activitiesRes.data?.forEach(a => timelineEvents.push({ id: a.id, type: a.action_type === 'update' ? 'update' : 'status_change', title: a.action_description, description: a.action_description, date: a.created_at || '' }));

      return timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    staleTime: 60 * 1000,
    enabled: !!beneficiaryId,
  });
}
