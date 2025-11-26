import { UnifiedTimeline, TimelineEvent } from "@/components/unified/UnifiedTimeline";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Distribution } from "@/hooks/useDistributions";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { useMemo } from "react";

interface DistributionTimelineTabProps {
  distribution: Distribution | null;
}

export function DistributionTimelineTab({ distribution }: DistributionTimelineTabProps) {
  const { data: approvals } = useQuery({
    queryKey: ['distribution-approvals', distribution?.id],
    queryFn: async () => {
      if (!distribution?.id) return [];
      
      const { data, error } = await supabase
        .from('distribution_approvals')
        .select('*')
        .eq('distribution_id', distribution.id)
        .order('level', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!distribution?.id,
  });

  const { data: history } = useQuery({
    queryKey: ['approval-history', distribution?.id],
    queryFn: async () => {
      if (!distribution?.id) return [];
      
      const { data, error } = await supabase
        .from('approval_history')
        .select('*')
        .eq('reference_id', distribution.id)
        .eq('approval_type', 'distribution')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!distribution?.id,
  });

  const events: TimelineEvent[] = useMemo(() => {
    if (!distribution) return [];

    const timelineEvents: TimelineEvent[] = [];

    // حدث إنشاء التوزيع
    timelineEvents.push({
      id: 'created',
      title: 'تم إنشاء التوزيع',
      description: `تم إنشاء توزيع شهر ${distribution.month} بمبلغ ${distribution.total_amount?.toLocaleString()} ر.س`,
      date: distribution.created_at || new Date(),
      icon: FileText,
      color: 'info',
      metadata: {
        'عدد المستفيدين': distribution.beneficiaries_count,
        'المبلغ الإجمالي': `${distribution.total_amount?.toLocaleString()} ر.س`,
      }
    });

    // أحداث الموافقات
    if (approvals && approvals.length > 0) {
      approvals.forEach((approval) => {
        if (approval.status === 'موافق') {
          timelineEvents.push({
            id: `approval-${approval.id}`,
            title: `موافقة المستوى ${approval.level}`,
            description: `تمت الموافقة من قبل ${approval.approver_name}`,
            date: approval.approved_at || approval.created_at,
            icon: CheckCircle,
            color: 'success',
            metadata: {
              'الموافق': approval.approver_name,
              'المستوى': `المستوى ${approval.level}`,
              ...(approval.notes && { 'ملاحظات': approval.notes })
            }
          });
        } else if (approval.status === 'مرفوض') {
          timelineEvents.push({
            id: `approval-${approval.id}`,
            title: `رفض المستوى ${approval.level}`,
            description: `تم الرفض من قبل ${approval.approver_name}`,
            date: approval.approved_at || approval.created_at,
            icon: XCircle,
            color: 'danger',
            metadata: {
              'المرفوض من': approval.approver_name,
              'المستوى': `المستوى ${approval.level}`,
              ...(approval.notes && { 'السبب': approval.notes })
            }
          });
        } else if (approval.status === 'معلق') {
          timelineEvents.push({
            id: `approval-${approval.id}`,
            title: `في انتظار موافقة المستوى ${approval.level}`,
            description: `بانتظار موافقة ${approval.approver_name}`,
            date: approval.created_at,
            icon: Clock,
            color: 'warning',
            metadata: {
              'المطلوب': approval.approver_name,
              'المستوى': `المستوى ${approval.level}`,
            }
          });
        }
      });
    }

    // أحداث السجل
    if (history && history.length > 0) {
      history.forEach((item) => {
        timelineEvents.push({
          id: `history-${item.id}`,
          title: item.action,
          description: item.notes || undefined,
          date: item.created_at,
          icon: FileText,
          color: 'primary',
          metadata: {
            ...(item.performed_by_name && { 'المنفذ': item.performed_by_name }),
          }
        });
      });
    }

    return timelineEvents;
  }, [distribution, approvals, history]);

  if (!distribution) {
    return (
      <div className="text-center text-muted-foreground py-8">
        اختر توزيعاً لعرض تاريخ الموافقات
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        لا توجد أحداث لهذا التوزيع
      </div>
    );
  }

  return <UnifiedTimeline events={events} variant="default" showDate={true} />;
}
