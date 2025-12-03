import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Clock, AlertTriangle, FileText } from 'lucide-react';

interface InvoicesStats {
  totalSales: number;
  paidCount: number;
  pendingCount: number;
  overdueAmount: number;
  overdueCount: number;
  totalCount: number;
}

interface InvoicesStatsCardsProps {
  stats: InvoicesStats;
}

export function InvoicesStatsCards({ stats }: InvoicesStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalSales.toFixed(2)} ر.س
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.paidCount} فاتورة مدفوعة
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">الفواتير المعلقة</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingCount}</div>
          <p className="text-xs text-muted-foreground mt-1">بانتظار الدفع</p>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">المتأخرات</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {stats.overdueAmount.toFixed(2)} ر.س
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.overdueCount} فاتورة متأخرة
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCount}</div>
          <p className="text-xs text-muted-foreground mt-1">فاتورة مسجلة</p>
        </CardContent>
      </Card>
    </div>
  );
}
