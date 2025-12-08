import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, AlertTriangle } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { exportToExcel, exportToPDF } from '@/lib/exportHelpers';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLoansAgingReport } from '@/hooks/reports/useLoansAgingReport';

export function LoansAgingReport() {
  const { toast } = useToast();
  const { agingData, agingByCategory, isLoading } = useLoansAgingReport();

  const handleExportPDF = () => {
    if (!agingData) return;

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

  const handleExportExcel = () => {
    if (!agingData) return;

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
              <Download className="h-4 w-4 ml-2" />
              PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline" size="sm">
              <Download className="h-4 w-4 ml-2" />
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
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap">رقم القرض</TableHead>
                  <TableHead className="text-xs sm:text-sm">المستفيد</TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">المبلغ الأصلي</TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap">المتبقي</TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">أيام التأخير</TableHead>
                  <TableHead className="text-xs sm:text-sm">الفئة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agingData?.map((loan) => (
                  <TableRow key={loan.loan_id}>
                    <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">{loan.loan_number}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{loan.beneficiary_name}</TableCell>
                    <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">{loan.principal_amount.toLocaleString('ar-SA')} ريال</TableCell>
                    <TableCell className="font-bold text-xs sm:text-sm whitespace-nowrap">{loan.remaining_balance.toLocaleString('ar-SA')} ريال</TableCell>
                    <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
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
        </CardContent>
      </Card>
    </div>
  );
}
