import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/LoadingState';
import { 
  Clock, 
  DollarSign, 
  FileText, 
  UserPlus, 
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Database } from '@/integrations/supabase/types';

type BeneficiaryRequest = Database['public']['Tables']['beneficiary_requests']['Row'] & {
  request_types?: { name_ar: string } | null;
};

interface ProfileTimelineProps {
  beneficiaryId: string;
}

interface TimelineEvent {
  id: string;
  type: 'payment' | 'request' | 'update' | 'status_change';
  title: string;
  description: string;
  date: string;
  status?: string;
  amount?: number;
}

export function ProfileTimeline({ beneficiaryId }: ProfileTimelineProps) {
  const { data: events, isLoading } = useQuery({
    queryKey: ['beneficiary-timeline', beneficiaryId],
    queryFn: async () => {
      const timelineEvents: TimelineEvent[] = [];

      // جلب المدفوعات
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
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
            date: request.created_at,
            status: request.status
          });
        });
      }

      // جلب سجل النشاط
      const { data: activities } = await supabase
        .from('beneficiary_activity_log')
        .select('*')
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
            date: activity.created_at
          });
        });
      }

      // ترتيب الأحداث حسب التاريخ
      return timelineEvents.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },
    staleTime: 60 * 1000, // 1 minute
  });

  if (isLoading) {
    return <LoadingState message="جاري تحميل الخط الزمني..." />;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      case 'request':
        return <FileText className="h-4 w-4" />;
      case 'update':
        return <Edit className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'معتمد': { label: 'معتمد', variant: 'default' },
      'مدفوع': { label: 'مدفوع', variant: 'default' },
      'قيد المراجعة': { label: 'قيد المراجعة', variant: 'secondary' },
      'معلق': { label: 'معلق', variant: 'secondary' },
      'مرفوض': { label: 'مرفوض', variant: 'destructive' },
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' as const };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">لا توجد أحداث في الخط الزمني</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          الخط الزمني
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* الخط الزمني العمودي */}
          <div className="absolute right-[17px] top-2 bottom-2 w-px bg-border" />

          {events.map((event, index) => (
            <div key={event.id} className="relative flex gap-4">
              {/* النقطة */}
              <div className="relative z-10 flex-shrink-0">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {getIcon(event.type)}
                </div>
              </div>

              {/* المحتوى */}
              <div className="flex-1 pb-4">
                <div className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">
                        {event.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                    {event.amount && (
                      <div className="text-left">
                        <span className="font-bold text-primary">
                          {event.amount.toLocaleString('ar-SA')} ريال
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {format(new Date(event.date), 'PPP', { locale: ar })}
                    </span>
                    {getStatusBadge(event.status)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
