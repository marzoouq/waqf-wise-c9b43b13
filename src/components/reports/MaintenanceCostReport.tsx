import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Wrench } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { exportToExcel, exportToPDF } from '@/lib/exportHelpers';
import { useToast } from '@/hooks/ui/use-toast';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMaintenanceCostReport } from '@/hooks/reports/useMaintenanceCostReport';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function MaintenanceCostReport() {
  const { toast } = useToast();
  const { maintenanceData, typeAnalysis, totals, isLoading } = useMaintenanceCostReport();

  const handleExportPDF = () => {
    if (!maintenanceData) return;

    const headers = ['العقار', 'التكلفة الإجمالية', 'العمليات المكتملة', 'العمليات المعلقة', 'متوسط التكلفة'];
    const data = maintenanceData.map(m => [
      m.property_name,
      `${m.total_cost.toLocaleString('ar-SA')} ريال`,
      m.completed_count,
      m.pending_count,
      `${m.avg_cost.toLocaleString('ar-SA')} ريال`
    ]);

    exportToPDF('تقرير تكاليف الصيانة', headers, data, 'maintenance_cost');
    
    toast({
      title: 'تم التصدير',
      description: 'تم تصدير تقرير تكاليف الصيانة بنجاح',
    });
  };

  const handleExportExcel = () => {
    if (!maintenanceData) return;

    const data = maintenanceData.map(m => ({
      'العقار': m.property_name,
      'التكلفة الإجمالية': m.total_cost,
      'العمليات المكتملة': m.completed_count,
      'العمليات المعلقة': m.pending_count,
      'متوسط التكلفة': m.avg_cost
    }));

    exportToExcel(data, 'maintenance_cost', 'تكاليف الصيانة');
    
    toast({
      title: 'تم التصدير',
      description: 'تم تصدير تقرير تكاليف الصيانة بنجاح',
    });
  };

  if (isLoading) {
    return <LoadingState message="جاري تحليل تكاليف الصيانة..." />;
  }


  return (
    <div className="space-y-6">
      {/* إحصائيات إجمالية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">التكلفة الإجمالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalCost.toLocaleString('ar-SA')} ريال</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">العمليات المكتملة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totals.totalCompleted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">العمليات المعلقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{totals.totalPending}</div>
          </CardContent>
        </Card>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* التكاليف حسب العقار */}
        <Card>
          <CardHeader>
            <CardTitle>التكاليف حسب العقار</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={maintenanceData?.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="property_name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toLocaleString('ar-SA')} ريال`} />
                <Legend />
                <Bar dataKey="total_cost" fill="#8884d8" name="التكلفة" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* التوزيع حسب النوع */}
        <Card>
          <CardHeader>
            <CardTitle>التوزيع حسب نوع الصيانة</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeAnalysis as unknown as { name: string; value: number }[]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {typeAnalysis?.map((_, index) => (
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
            <Wrench className="h-5 w-5" />
            تفاصيل تكاليف الصيانة حسب العقار
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
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">العقار</TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap">التكلفة الإجمالية</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">المكتمل</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">المعلق</TableHead>
                  <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">متوسط التكلفة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceData?.map((maintenance) => (
                  <TableRow key={maintenance.property_id}>
                    <TableCell className="font-medium text-xs sm:text-sm">{maintenance.property_name}</TableCell>
                    <TableCell className="font-bold text-xs sm:text-sm whitespace-nowrap">
                      {maintenance.total_cost.toLocaleString('ar-SA')} ريال
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                      <Badge variant="secondary">{maintenance.completed_count}</Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                      <Badge variant="outline">{maintenance.pending_count}</Badge>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">
                      {maintenance.avg_cost.toLocaleString('ar-SA')} ريال
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
