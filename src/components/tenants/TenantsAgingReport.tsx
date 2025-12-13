import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenantsAging } from '@/hooks/property/useTenantLedger';
import { formatCurrency } from '@/lib/utils';
import { AlertTriangle, Clock } from 'lucide-react';

export function TenantsAgingReport() {
  const { data: agingData = [], isLoading } = useTenantsAging();

  const totals = agingData.reduce(
    (acc, item) => ({
      current: acc.current + item.current,
      days_30: acc.days_30 + item.days_30,
      days_60: acc.days_60 + item.days_60,
      days_90: acc.days_90 + item.days_90,
      over_90: acc.over_90 + item.over_90,
      total: acc.total + item.total,
    }),
    { current: 0, days_30: 0, days_60: 0, days_90: 0, over_90: 0, total: 0 }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <CardTitle>تقرير أعمار الديون</CardTitle>
        </div>
        <CardDescription>
          تحليل ذمم المستأجرين حسب فترة الاستحقاق
        </CardDescription>
      </CardHeader>
      <CardContent>
        {agingData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد ذمم مستحقة
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستأجر</TableHead>
                  <TableHead className="text-left">جاري (0-30)</TableHead>
                  <TableHead className="text-left">31-60 يوم</TableHead>
                  <TableHead className="text-left">61-90 يوم</TableHead>
                  <TableHead className="text-left">91-120 يوم</TableHead>
                  <TableHead className="text-left">
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      أكثر من 120
                    </div>
                  </TableHead>
                  <TableHead className="text-left font-bold">الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agingData.map((item) => (
                  <TableRow key={item.tenant_id}>
                    <TableCell className="font-medium">{item.tenant_name}</TableCell>
                    <TableCell className="text-left">
                      {item.current > 0 ? formatCurrency(item.current) : '-'}
                    </TableCell>
                    <TableCell className="text-left text-status-warning">
                      {item.days_30 > 0 ? formatCurrency(item.days_30) : '-'}
                    </TableCell>
                    <TableCell className="text-left text-amber-600">
                      {item.days_60 > 0 ? formatCurrency(item.days_60) : '-'}
                    </TableCell>
                    <TableCell className="text-left text-status-error">
                      {item.days_90 > 0 ? formatCurrency(item.days_90) : '-'}
                    </TableCell>
                    <TableCell className="text-left text-destructive font-medium">
                      {item.over_90 > 0 ? formatCurrency(item.over_90) : '-'}
                    </TableCell>
                    <TableCell className="text-left font-bold">
                      {formatCurrency(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>الإجمالي</TableCell>
                  <TableCell className="text-left">{formatCurrency(totals.current)}</TableCell>
                  <TableCell className="text-left text-status-warning">
                    {formatCurrency(totals.days_30)}
                  </TableCell>
                  <TableCell className="text-left text-amber-600">
                    {formatCurrency(totals.days_60)}
                  </TableCell>
                  <TableCell className="text-left text-status-error">
                    {formatCurrency(totals.days_90)}
                  </TableCell>
                  <TableCell className="text-left text-destructive">
                    {formatCurrency(totals.over_90)}
                  </TableCell>
                  <TableCell className="text-left text-lg">
                    {formatCurrency(totals.total)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
