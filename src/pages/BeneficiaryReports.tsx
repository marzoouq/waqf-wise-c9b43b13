import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Printer, TrendingUp, DollarSign } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '@/hooks/ui/use-toast';
import { MobileOptimizedLayout, MobileOptimizedHeader } from '@/components/layout/MobileOptimizedLayout';
import { PageErrorBoundary } from '@/components/shared/PageErrorBoundary';
import { useBeneficiaryPersonalReportsData } from '@/hooks/beneficiary/useBeneficiaryPersonalReportsData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function BeneficiaryReports() {
  const { toast } = useToast();
  const {
    beneficiary,
    distributions,
    yearlyStats,
    monthlyData,
    requestsStatusData,
    isLoading,
    error,
    refetch,
    selectedYear,
    setSelectedYear,
    reportType,
    setReportType,
  } = useBeneficiaryPersonalReportsData();

  // تصدير التقرير السنوي PDF
  const exportAnnualReport = async () => {
    const [jsPDFModule, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
    
    const jsPDF = jsPDFModule.default;
    const autoTable = autoTableModule.default;
    const doc = new jsPDF();
    doc.setR2L(true);
    
    // العنوان
    doc.setFontSize(20);
    doc.text(`التقرير السنوي ${selectedYear}`, 105, 20, { align: 'center' });
    
    // معلومات المستفيد
    doc.setFontSize(12);
    doc.text(`الاسم: ${beneficiary?.full_name || ''}`, 20, 40);
    doc.text(`رقم المستفيد: ${beneficiary?.beneficiary_number || ''}`, 20, 50);
    doc.text(`تاريخ التقرير: ${format(new Date(), 'dd/MM/yyyy')}`, 20, 60);
    
    // الإحصائيات الرئيسية
    doc.setFontSize(14);
    doc.text('الإحصائيات السنوية', 20, 75);
    doc.setFontSize(11);
    doc.text(`إجمالي المستلم: ${formatCurrency(yearlyStats.totalReceived)}`, 25, 85);
    doc.text(`عدد التوزيعات: ${yearlyStats.paymentsCount}`, 25, 93);
    doc.text(`متوسط التوزيع: ${formatCurrency(yearlyStats.avgPayment)}`, 25, 101);
    doc.text(`عدد الطلبات: ${yearlyStats.requestsCount}`, 25, 109);
    doc.text(`الطلبات المعتمدة: ${yearlyStats.approvedRequests}`, 25, 117);
    
    // جدول التوزيعات الشهرية
    const tableData = monthlyData
      .filter(m => m.amount > 0)
      .map(m => [m.month, m.count, formatCurrency(m.amount)]);
    
    doc.autoTable({
      startY: 130,
      head: [['الشهر', 'عدد التوزيعات', 'المبلغ الإجمالي']],
      body: tableData,
      styles: { font: 'helvetica', fontSize: 10 },
      headStyles: { fillColor: [71, 85, 105] },
    });
    
    doc.save(`تقرير-سنوي-${selectedYear}.pdf`);
    
    toast({
      title: 'تم التصدير بنجاح',
      description: 'تم تنزيل التقرير السنوي',
    });
  };

  // طباعة التقرير
  const printReport = () => {
    window.print();
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل التقارير..." />;
  }

  if (error) {
    return <ErrorState title="خطأ في التحميل" message="فشل تحميل التقارير" onRetry={refetch} />;
  }

  return (
    <PageErrorBoundary pageName="التقارير والتحليلات">
      <MobileOptimizedLayout className="print:p-0">
        <div className="print:hidden">
          <MobileOptimizedHeader
            title="التقارير والتحليلات"
            description="تقارير تفصيلية عن حسابك والمدفوعات"
            icon={<FileText className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
            actions={
              <div className="flex gap-2">
                <Button onClick={printReport} variant="outline" size="sm" className="min-h-[44px]">
                  <Printer className="h-4 w-4 sm:ms-2" />
                  <span className="hidden sm:inline">طباعة</span>
                </Button>
                <Button onClick={exportAnnualReport} size="sm" className="min-h-[44px]">
                  <Download className="h-4 w-4 sm:ms-2" />
                  <span className="hidden sm:inline">تصدير PDF</span>
                </Button>
              </div>
            }
          />
        </div>

      {/* خيارات التقرير */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>إعدادات التقرير</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">السنة المالية</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">نوع التقرير</label>
            <Select value={reportType} onValueChange={(v) => setReportType(v as 'annual' | 'quarterly' | 'monthly')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">سنوي</SelectItem>
                <SelectItem value="quarterly">ربع سنوي</SelectItem>
                <SelectItem value="monthly">شهري</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* معلومات المستفيد */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات المستفيد</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">الاسم الكامل</p>
            <p className="font-semibold">{beneficiary?.full_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">رقم المستفيد</p>
            <p className="font-semibold font-mono">{beneficiary?.beneficiary_number}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">الحالة</p>
            <p className="font-semibold text-success">{beneficiary?.status}</p>
          </div>
        </CardContent>
      </Card>

      {/* الإحصائيات السنوية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              إجمالي المستلم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(yearlyStats.totalReceived)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              عدد التوزيعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yearlyStats.paymentsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              متوسط التوزيع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(yearlyStats.avgPayment)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yearlyStats.requestsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المعتمدة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{yearlyStats.approvedRequests}</div>
          </CardContent>
        </Card>
      </div>

      {/* المخططات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* مخطط التوزيعات الشهرية */}
        <Card>
          <CardHeader>
            <CardTitle>التوزيعات الشهرية</CardTitle>
            <CardDescription>توزيع المستحقات على مدار السنة</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: '#000' }}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* مخطط حالة الطلبات */}
        <Card>
          <CardHeader>
            <CardTitle>حالة الطلبات</CardTitle>
            <CardDescription>توزيع الطلبات حسب الحالة</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={requestsStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {requestsStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* مخطط الاتجاه الزمني */}
      <Card>
        <CardHeader>
          <CardTitle>الاتجاه الزمني للتوزيعات</CardTitle>
          <CardDescription>تطور التوزيعات خلال العام</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: '#000' }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
