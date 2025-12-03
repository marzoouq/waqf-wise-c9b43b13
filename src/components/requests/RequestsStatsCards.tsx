import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RequestsStats {
  total: number;
  pending: number;
  inProgress: number;
  approved: number;
  rejected: number;
  overdue: number;
}

interface RequestsStatsCardsProps {
  stats: RequestsStats;
}

export function RequestsStatsCards({ stats }: RequestsStatsCardsProps) {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
      <Card>
        <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            إجمالي الطلبات
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="text-lg sm:text-xl md:text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            معلق
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-warning">{stats.pending}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            قيد المعالجة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary">{stats.inProgress}</div>
        </CardContent>
      </Card>

      <Card className="hidden sm:block">
        <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            موافق عليه
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-success">{stats.approved}</div>
        </CardContent>
      </Card>

      <Card className="hidden md:block">
        <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            مرفوض
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-destructive">{stats.rejected}</div>
        </CardContent>
      </Card>

      <Card className="hidden md:block">
        <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            متأخر
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-destructive">{stats.overdue}</div>
        </CardContent>
      </Card>
    </div>
  );
}
