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
import { ErrorState } from '@/components/shared/ErrorState';
import { useIsMobile } from '@/hooks/ui/use-mobile';
import { Badge } from '@/components/ui/badge';

export function TenantsAgingReport() {
  const { data: agingData = [], isLoading, error, refetch } = useTenantsAging();
  const isMobile = useIsMobile();

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

  if (error) {
    return <ErrorState title="خطأ في تحميل تقرير أعمار الديون" message={(error as Error).message} onRetry={refetch} />;
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
        ) : isMobile ? (
          // Mobile Card View
          <div className="space-y-3">
            {agingData.map((item) => (
              <Card key={item.tenant_id} className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{item.tenant_name}</span>
                  <Badge variant="destructive" className="text-xs">
                    {formatCurrency(item.total)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">جاري:</span>
                    <span>{item.current > 0 ? formatCurrency(item.current) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">31-60:</span>
                    <span className="text-status-warning">{item.days_30 > 0 ? formatCurrency(item.days_30) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">61-90:</span>
                    <span className="text-amber-600">{item.days_60 > 0 ? formatCurrency(item.days_60) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">91-120:</span>
                    <span className="text-status-error">{item.days_90 > 0 ? formatCurrency(item.days_90) : '-'}</span>
                  </div>
                  {item.over_90 > 0 && (
                    <div className="col-span-2 flex justify-between border-t pt-1 mt-1">
                      <span className="text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        أكثر من 120:
                      </span>
                      <span className="text-destructive font-medium">{formatCurrency(item.over_90)}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {/* Mobile Totals Card */}
            <Card className="p-3 bg-muted/50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">الإجمالي</span>
                <span className="font-bold text-lg">{formatCurrency(totals.total)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>جاري:</span>
                  <span>{formatCurrency(totals.current)}</span>
                </div>
                <div className="flex justify-between">
                  <span>31-60:</span>
                  <span className="text-status-warning">{formatCurrency(totals.days_30)}</span>
                </div>
                <div className="flex justify-between">
                  <span>61-90:</span>
                  <span className="text-amber-600">{formatCurrency(totals.days_60)}</span>
                </div>
                <div className="flex justify-between">
                  <span>91-120:</span>
                  <span className="text-status-error">{formatCurrency(totals.days_90)}</span>
                </div>
                <div className="col-span-2 flex justify-between">
                  <span className="text-destructive">أكثر من 120:</span>
                  <span className="text-destructive">{formatCurrency(totals.over_90)}</span>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          // Desktop Table View
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
