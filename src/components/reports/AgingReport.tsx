import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAgingReport } from '@/hooks/reports/useAgingReport';
import { ErrorState } from '@/components/shared/ErrorState';

export function AgingReport() {
  const { agingData, summary, isLoading, error, refetch } = useAgingReport();

  const getAgeCategoryBadge = (category: string, days: number) => {
    if (category === 'current') {
      return <Badge className="bg-success">جاري</Badge>;
    } else if (category === '1-30') {
      return <Badge className="bg-warning">متأخر {days} يوم</Badge>;
    } else if (category === '30-60') {
      return <Badge className="bg-warning">متأخر {days} يوم</Badge>;
    } else if (category === '60-90') {
      return <Badge variant="destructive">متأخر {days} يوم</Badge>;
    } else {
      return <Badge variant="destructive">متأخر {days} يوم</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">جاري التحميل...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل تقرير الأعمار" message={(error as Error).message} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            تقرير أعمار الديون
          </CardTitle>
          <CardDescription>
            تحليل الديون المستحقة والمتأخرة حسب فترات العمر
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* ملخص الأعمار */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">جاري</div>
                <div className="text-lg font-bold text-success">
                  {formatCurrency(summary?.current || 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">1-30 يوم</div>
                <div className="text-lg font-bold text-warning">
                  {formatCurrency(summary?.['1-30'] || 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">30-60 يوم</div>
                <div className="text-lg font-bold text-warning">
                  {formatCurrency(summary?.['30-60'] || 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">60-90 يوم</div>
                <div className="text-lg font-bold text-destructive">
                  {formatCurrency(summary?.['60-90'] || 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">+90 يوم</div>
                <div className="text-lg font-bold text-destructive">
                  {formatCurrency(summary?.['90+'] || 0)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-primary">
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">الإجمالي</div>
                <div className="text-lg font-bold text-primary">
                  {formatCurrency(summary?.total || 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* جدول التفاصيل */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستفيد</TableHead>
                  <TableHead>تاريخ الاستحقاق</TableHead>
                  <TableHead>المبلغ المستحق</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التصنيف</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!agingData || agingData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      لا توجد ديون مستحقة
                    </TableCell>
                  </TableRow>
                ) : (
                  agingData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.beneficiary_name || 'غير معروف'}
                      </TableCell>
                      <TableCell>
                        {new Date(item.due_date).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>{formatCurrency(item.amount_due)}</TableCell>
                      <TableCell>
                        {item.daysPastDue > 0 && (
                          <div className="flex items-center gap-1 text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            متأخر
                          </div>
                        )}
                        {item.daysPastDue <= 0 && (
                          <span className="text-success">جاري</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getAgeCategoryBadge(item.ageCategory, item.daysPastDue)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
