import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { exportToExcel, exportToPDF } from '@/lib/exportHelpers';
import { useToast } from '@/hooks/use-toast';
import { ReportRefreshIndicator } from './ReportRefreshIndicator';
import { useDistributionAnalysisReport } from '@/hooks/reports/useDistributionAnalysisReport';

export function DistributionAnalysisReport() {
  const { toast } = useToast();
  const { 
    distributionTrends, 
    statusStats, 
    totals, 
    isLoading, 
    isRefetching, 
    lastUpdated, 
    handleRefresh 
  } = useDistributionAnalysisReport();

  const handleExportPDF = () => {
    if (!distributionTrends) return;

    const headers = ['الشهر', 'المبلغ الإجمالي', 'عدد المستفيدين', 'المتوسط للمستفيد'];
    const data = distributionTrends.map(d => [
      d.month,
      `${d.totalAmount.toLocaleString('ar-SA')} ريال`,
      d.beneficiariesCount,
      `${d.avgPerBeneficiary.toLocaleString('ar-SA')} ريال`
    ]);

    exportToPDF('تحليل التوزيعات', headers, data, 'distribution_analysis');
    
    toast({
      title: 'تم التصدير',
      description: 'تم تصدير تحليل التوزيعات بنجاح',
    });
  };

  const handleExportExcel = () => {
    if (!distributionTrends) return;

    const data = distributionTrends.map(d => ({
      'الشهر': d.month,
      'المبلغ الإجمالي': d.totalAmount,
      'عدد المستفيدين': d.beneficiariesCount,
      'عدد التوزيعات': d.distributionsCount,
      'المتوسط للمستفيد': d.avgPerBeneficiary
    }));

    exportToExcel(data, 'distribution_analysis', 'تحليل التوزيعات');
    
    toast({
      title: 'تم التصدير',
      description: 'تم تصدير تحليل التوزيعات بنجاح',
    });
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل بيانات التوزيعات..." />;
  }

  return (
    <div className="space-y-6">
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التوزيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.totalAmount.toLocaleString('ar-SA')} ريال
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستفيدين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.totalBeneficiaries.toLocaleString('ar-SA')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">عدد الأشهر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.totalMonths}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">المتوسط الشهري</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.monthlyAverage.toLocaleString('ar-SA')} ريال
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الرسوم البيانية */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            تحليل التوزيعات حسب الوقت
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <ReportRefreshIndicator
              lastUpdated={lastUpdated}
              isRefetching={isRefetching}
              onRefresh={handleRefresh}
            />
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
          <div className="space-y-6">
            {/* رسم بياني للمبالغ */}
            <div>
              <h3 className="text-sm font-medium mb-4">إجمالي المبالغ الموزعة</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distributionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString('ar-SA')} ريال`} />
                  <Legend />
                  <Bar dataKey="totalAmount" fill="#8884d8" name="المبلغ الإجمالي" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* رسم بياني لعدد المستفيدين */}
            <div>
              <h3 className="text-sm font-medium mb-4">عدد المستفيدين</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={distributionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="beneficiariesCount" stroke="#82ca9d" name="عدد المستفيدين" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* متوسط النصيب للمستفيد */}
            <div>
              <h3 className="text-sm font-medium mb-4">متوسط النصيب للمستفيد</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={distributionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString('ar-SA')} ريال`} />
                  <Legend />
                  <Line type="monotone" dataKey="avgPerBeneficiary" stroke="#ffc658" name="متوسط النصيب" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* توزيع الحالات */}
      <Card>
        <CardHeader>
          <CardTitle>توزيع التوزيعات حسب الحالة</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#00C49F" name="العدد" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
