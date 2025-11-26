import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText, TrendingUp, Clock } from 'lucide-react';

interface BeneficiaryStatsProps {
  stats: {
    total_payments?: number;
    total_amount?: number;
    pending_requests?: number;
    last_payment_date?: string;
  };
}

/**
 * إحصائيات المستفيد - المرحلة 2
 */
export function BeneficiaryStats({ stats }: BeneficiaryStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المدفوعات</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats.total_amount || 0).toLocaleString()} ريال
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.total_payments || 0} دفعة
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">عدد المدفوعات</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_payments || 0}</div>
          <p className="text-xs text-muted-foreground">دفعة مكتملة</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الطلبات المعلقة</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending_requests || 0}</div>
          <p className="text-xs text-muted-foreground">قيد المعالجة</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">آخر دفعة</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.last_payment_date ? (
              new Date(stats.last_payment_date).toLocaleDateString('ar-SA', {
                month: 'short',
                year: 'numeric'
              })
            ) : '-'}
          </div>
          <p className="text-xs text-muted-foreground">تاريخ آخر صرف</p>
        </CardContent>
      </Card>
    </div>
  );
}
