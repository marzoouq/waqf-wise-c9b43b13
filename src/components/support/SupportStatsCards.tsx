import { MessageSquare, Clock, CheckCircle, Star } from 'lucide-react';
import { UnifiedKPICard } from '@/components/unified/UnifiedKPICard';
import { UnifiedStatsGrid } from '@/components/unified/UnifiedStatsGrid';

interface StatsData {
  ticketsByStatus?: {
    open?: number;
    in_progress?: number;
    resolved?: number;
    closed?: number;
  };
  avgSatisfaction?: number;
  totalRatings?: number;
}

interface SupportStatsCardsProps {
  stats: StatsData | null;
}

export function SupportStatsCards({ stats }: SupportStatsCardsProps) {
  return (
    <UnifiedStatsGrid columns={4}>
      <UnifiedKPICard
        title="التذاكر المفتوحة"
        value={stats?.ticketsByStatus?.open || 0}
        icon={MessageSquare}
        variant="warning"
        subtitle="بحاجة للمراجعة"
      />

      <UnifiedKPICard
        title="قيد المعالجة"
        value={stats?.ticketsByStatus?.in_progress || 0}
        icon={Clock}
        variant="info"
        subtitle="جاري العمل عليها"
      />

      <UnifiedKPICard
        title="تم الحل"
        value={stats?.ticketsByStatus?.resolved || 0}
        icon={CheckCircle}
        variant="success"
        subtitle="بانتظار الإغلاق"
      />

      <UnifiedKPICard
        title="معدل الرضا"
        value={stats?.avgSatisfaction?.toFixed(1) || '0.0'}
        icon={Star}
        variant="primary"
        subtitle={`من 5.0 (${stats?.totalRatings || 0} تقييم)`}
      />
    </UnifiedStatsGrid>
  );
}
