import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, AlertTriangle } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/ui/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLoansAgingReport } from '@/hooks/reports/useLoansAgingReport';
import { useIsMobile } from '@/hooks/ui/use-mobile';

export function LoansAgingReport() {
  const { toast } = useToast();
  const { agingData, agingByCategory, isLoading } = useLoansAgingReport();
  const isMobile = useIsMobile();

  // ✅ Dynamic import - يُحمّل فقط عند الضغط على زر التصدير
  const handleExportPDF = async () => {
    if (!agingData) return;

    const { exportToPDF } = await import('@/lib/exportHelpers');
    const headers = ['رقم القرض', 'المستفيد', 'المبلغ الأصلي', 'المدفوع', 'المتبقي', 'أيام التأخير', 'الفئة'];
    const data = agingData.map(l => [
      l.loan_number,
      l.beneficiary_name,
      `${l.principal_amount.toLocaleString('ar-SA')} ريال`,
      `${l.total_paid.toLocaleString('ar-SA')} ريال`,
      `${l.remaining_balance.toLocaleString('ar-SA')} ريال`,
      l.days_overdue,
      l.aging_category
    ]);

    exportToPDF('تقرير أعمار الديون', headers, data, 'loans_aging');
    
    toast({
      title: 'تم التصدير',
      description: 'تم تصدير تقرير أعمار الديون بنجاح',
    });
  };

  // ✅ Dynamic import - يُحمّل فقط عند الضغط على زر التصدير
  const handleExportExcel = async () => {
    if (!agingData) return;

    const { exportToExcel } = await import('@/lib/exportHelpers');
    const data = agingData.map(l => ({
      'رقم القرض': l.loan_number,
      'اسم المستفيد': l.beneficiary_name,
      'المبلغ الأصلي': l.principal_amount,
      'المبلغ المدفوع': l.total_paid,
      'الرصيد المتبقي': l.remaining_balance,
      'أيام التأخير': l.days_overdue,
      'فئة العمر': l.aging_category
    }));

    exportToExcel(data, 'loans_aging', 'أعمار الديون');
    
    toast({
      title: 'تم التصدير',
      description: 'تم تصدير تقرير أعمار الديون بنجاح',
    });
  };

  if (isLoading) {
    return <LoadingState message="جاري تحليل أعمار الديون..." />;
  }

  return (
    <div className="space-y-6">
      {/* التحليل البياني */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            تحليل أعمار الديون
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={handleExportPDF} variant="outline" size="sm">
              <Download className="h-4 w-4 ms-2" />
              PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline" size="sm">
              <Download className="h-4 w-4 ms-2" />
              Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agingByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="عدد القروض" />
              <Bar dataKey="amount" fill="#82ca9d" name="المبلغ المتبقي" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* الجدول التفصيلي */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل القروض حسب أيام التأخير</CardTitle>
        </CardHeader>
        <CardContent>
          {!agingData || agingData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد قروض متأخرة
            </div>
          ) : isMobile ? (
            // Mobile Card View
            <div className="space-y-3">
              {agingData.map((loan) => (
                <Card key={loan.loan_id} className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-mono text-sm text-muted-foreground">{loan.loan_number}</span>
                      <p className="font-medium">{loan.beneficiary_name}</p>
                    </div>
                    <Badge variant={
                      loan.aging_category.includes('خطير') ? 'destructive' :
                      loan.aging_category.includes('متأخر جداً') ? 'destructive' :
                      loan.aging_category.includes('متأخر') ? 'default' : 'secondary'
                    }>
                      {loan.aging_category}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الأصلي:</span>
                      <span>{loan.principal_amount.toLocaleString('ar-SA')} ريال</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المتبقي:</span>
                      <span className="font-bold">{loan.remaining_balance.toLocaleString('ar-SA')} ريال</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t">
                    <span className="text-muted-foreground text-sm">أيام التأخير:</span>
                    <Badge variant={loan.days_overdue > 60 ? 'destructive' : loan.days_overdue > 30 ? 'default' : 'secondary'}>
                      {loan.days_overdue} يوم
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            // Desktop Table View
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">رقم القرض</TableHead>
                    <TableHead className="text-xs sm:text-sm">المستفيد</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">المبلغ الأصلي</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">المتبقي</TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">أيام التأخير</TableHead>
                    <TableHead className="text-xs sm:text-sm">الفئة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agingData.map((loan) => (
                    <TableRow key={loan.loan_id}>
                      <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">{loan.loan_number}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{loan.beneficiary_name}</TableCell>
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap">{loan.principal_amount.toLocaleString('ar-SA')} ريال</TableCell>
                      <TableCell className="font-bold text-xs sm:text-sm whitespace-nowrap">{loan.remaining_balance.toLocaleString('ar-SA')} ريال</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge variant={loan.days_overdue > 60 ? 'destructive' : loan.days_overdue > 30 ? 'default' : 'secondary'}>
                          {loan.days_overdue} يوم
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge variant={
                          loan.aging_category.includes('خطير') ? 'destructive' :
                          loan.aging_category.includes('متأخر جداً') ? 'destructive' :
                          loan.aging_category.includes('متأخر') ? 'default' : 'secondary'
                        }>
                          {loan.aging_category}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
