import { UsersRound, Users, TrendingUp } from 'lucide-react';
import { UnifiedKPICard } from '@/components/unified/UnifiedKPICard';
import { UnifiedStatsGrid } from '@/components/unified/UnifiedStatsGrid';

interface FamiliesStats {
  total: number;
  active: number;
  totalMembers: number;
}

interface FamiliesStatsCardsProps {
  stats: FamiliesStats;
}

export function FamiliesStatsCards({ stats }: FamiliesStatsCardsProps) {
  return (
    <UnifiedStatsGrid columns={3}>
      <UnifiedKPICard
        title="إجمالي العائلات"
        value={stats.total}
        icon={UsersRound}
        variant="default"
      />

      <UnifiedKPICard
        title="العائلات النشطة"
        value={stats.active}
        icon={TrendingUp}
        variant="success"
      />

      <UnifiedKPICard
        title="إجمالي الأفراد"
        value={stats.totalMembers}
        icon={Users}
        variant="default"
      />
    </UnifiedStatsGrid>
  );
}
