import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            إجمالي العائلات
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            العائلات النشطة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="text-xl sm:text-2xl font-bold text-primary">
            {stats.active}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            إجمالي الأفراد
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="text-xl sm:text-2xl font-bold">
            {stats.totalMembers}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
