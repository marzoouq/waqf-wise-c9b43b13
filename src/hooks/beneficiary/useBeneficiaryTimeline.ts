/**
 * Hook لجلب بيانات الخط الزمني للمستفيد
 * Beneficiary Timeline Hook
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type BeneficiaryRequest = Database['public']['Tables']['beneficiary_requests']['Row'] & {
  request_types?: { name_ar: string } | null;
};

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
    queryKey: ['beneficiary-timeline', beneficiaryId],
    queryFn: async () => {
      const timelineEvents: TimelineEvent[] = [];

      // جلب المدفوعات
      const { data: payments } = await supabase
        .from('payments')
        .select('id, amount, description, payment_date')
        .eq('beneficiary_id', beneficiaryId)
        .order('payment_date', { ascending: false })
        .limit(10);

      if (payments) {
        payments.forEach(payment => {
          timelineEvents.push({
            id: payment.id,
            type: 'payment',
            title: 'دفعة مالية',
            description: payment.description || 'دفعة من الوقف',
            date: payment.payment_date,
            amount: payment.amount
          });
        });
      }

      // جلب الطلبات
      const { data: requests } = await supabase
        .from('beneficiary_requests')
        .select('*, request_types(name_ar)')
        .eq('beneficiary_id', beneficiaryId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (requests) {
        (requests as BeneficiaryRequest[]).forEach((request) => {
          timelineEvents.push({
            id: request.id,
            type: 'request',
            title: request.request_types?.name_ar || 'طلب جديد',
            description: request.description,
            date: request.created_at || '',
            status: request.status || undefined
          });
        });
      }

      // جلب سجل النشاط
      const { data: activities } = await supabase
        .from('beneficiary_activity_log')
        .select('id, action_type, action_description, created_at')
        .eq('beneficiary_id', beneficiaryId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activities) {
        activities.forEach(activity => {
          timelineEvents.push({
            id: activity.id,
            type: activity.action_type === 'update' ? 'update' : 'status_change',
            title: activity.action_description,
            description: activity.action_description,
            date: activity.created_at || ''
          });
        });
      }

      // ترتيب الأحداث حسب التاريخ
      return timelineEvents.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },
    staleTime: 60 * 1000,
  });
}
