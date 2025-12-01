import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Clock, CheckCircle, Star } from 'lucide-react';

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
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            التذاكر المفتوحة
          </CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">
            {stats?.ticketsByStatus?.open || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            بحاجة للمراجعة
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            قيد المعالجة
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">
            {stats?.ticketsByStatus?.in_progress || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            جاري العمل عليها
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            تم الحل
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">
            {stats?.ticketsByStatus?.resolved || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            بانتظار الإغلاق
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">
            معدل الرضا
          </CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold">
            {stats?.avgSatisfaction?.toFixed(1) || '0.0'}
          </div>
          <p className="text-xs text-muted-foreground">
            من 5.0 ({stats?.totalRatings || 0} تقييم)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
