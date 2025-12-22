import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, PieChart as PieChartIcon } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/ui/use-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFundsPerformanceReport } from '@/hooks/reports/useFundsPerformanceReport';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--status-success))', 'hsl(var(--status-warning))', 'hsl(var(--status-error))', 'hsl(var(--chart-5))'];

export function FundsPerformanceReport() {
  const { toast } = useToast();
  const { fundPerformance, categoryDistribution, totals, isLoading } = useFundsPerformanceReport();

  // ✅ Dynamic import - يُحمّل فقط عند الضغط على زر التصدير
  const handleExportPDF = async () => {
    if (!fundPerformance) return;

    const { exportToPDF } = await import('@/lib/exportHelpers');
    const headers = ['اسم المصرف', 'الفئة', 'المخصص', 'المنفق', 'المستفيدون', 'نسبة الاستخدام'];
    const data = fundPerformance.map(f => [
      f.fund_name,
      f.category,
      `${f.allocated_amount.toLocaleString('ar-SA')} ريال`,
      `${f.spent_amount.toLocaleString('ar-SA')} ريال`,
      f.beneficiaries_count,
      `${f.utilization_rate.toFixed(1)}%`
    ]);

    exportToPDF('تقرير أداء المصارف', headers, data, 'funds_performance');
    
    toast({
      title: 'تم التصدير',
      description: 'تم تصدير تقرير أداء المصارف بنجاح',
    });
  };

  // ✅ Dynamic import - يُحمّل فقط عند الضغط على زر التصدير
  const handleExportExcel = async () => {
    if (!fundPerformance) return;

    const { exportToExcel } = await import('@/lib/exportHelpers');
    const data = fundPerformance.map(f => ({
      'اسم المصرف': f.fund_name,
      'الفئة': f.category,
      'المبلغ المخصص': f.allocated_amount,
      'المبلغ المنفق': f.spent_amount,
      'المبلغ المتبقي': f.allocated_amount - f.spent_amount,
      'عدد المستفيدين': f.beneficiaries_count,
      'نسبة الاستخدام (%)': f.utilization_rate.toFixed(2),
      'متوسط المستفيد': f.avg_per_beneficiary.toFixed(2)
    }));

    exportToExcel(data, 'funds_performance', 'أداء المصارف');
    
    toast({
      title: 'تم التصدير',
      description: 'تم تصدير تقرير أداء المصارف بنجاح',
    });
  };

  if (isLoading) {
    return <LoadingState message="جاري تحليل أداء المصارف..." />;
  }


  return (
    <div className="space-y-6">
      {/* ملخص الأداء */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المخصصات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalAllocated.toLocaleString('ar-SA')} ريال</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنفق</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totals.totalSpent.toLocaleString('ar-SA')} ريال</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">المتبقي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              {(totals.totalAllocated - totals.totalSpent).toLocaleString('ar-SA')} ريال
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">نسبة الاستخدام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.overallUtilization.toFixed(1)}%</div>
            <Progress value={totals.overallUtilization} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* أداء المصارف */}
        <Card>
          <CardHeader>
            <CardTitle>أداء المصارف (المنفق)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fundPerformance?.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fund_name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toLocaleString('ar-SA')} ريال`} />
                <Legend />
                <Bar dataKey="allocated_amount" fill="hsl(var(--primary))" name="المخصص" />
                <Bar dataKey="spent_amount" fill="hsl(var(--status-success))" name="المنفق" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* التوزيع حسب الفئة */}
        <Card>
          <CardHeader>
            <CardTitle>التوزيع حسب فئة المصرف</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution as unknown as { name: string; value: number }[]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {categoryDistribution?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString('ar-SA')} ريال`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* الجدول التفصيلي */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            أداء المصارف التفصيلي
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
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المصرف</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>المخصص</TableHead>
                  <TableHead>المنفق</TableHead>
                  <TableHead>المستفيدون</TableHead>
                  <TableHead>نسبة الاستخدام</TableHead>
                  <TableHead>متوسط المستفيد</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fundPerformance?.map((fund) => (
                  <TableRow key={fund.fund_id}>
                    <TableCell className="font-medium">{fund.fund_name}</TableCell>
                    <TableCell>{fund.category}</TableCell>
                    <TableCell>{fund.allocated_amount.toLocaleString('ar-SA')} ريال</TableCell>
                    <TableCell className="font-bold">{fund.spent_amount.toLocaleString('ar-SA')} ريال</TableCell>
                    <TableCell>{fund.beneficiaries_count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={fund.utilization_rate} className="w-20" />
                        <span className="text-sm">{fund.utilization_rate.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{fund.avg_per_beneficiary.toLocaleString('ar-SA')} ريال</TableCell>
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
