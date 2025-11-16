import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Wrench } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { exportToExcel, exportToPDF } from '@/lib/exportHelpers';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface MaintenanceCostData {
  property_id: string;
  property_name: string;
  total_cost: number;
  completed_count: number;
  pending_count: number;
  avg_cost: number;
}

export function MaintenanceCostReport() {
  const { toast } = useToast();

  // تحليل تكاليف الصيانة
  const { data: maintenanceData, isLoading } = useQuery<MaintenanceCostData[]>({
    queryKey: ['maintenance-cost-analysis'],
    queryFn: async () => {
      const { data: requests, error } = await supabase
        .from('maintenance_requests')
        .select(`
          id,
          estimated_cost,
          actual_cost,
          status,
          properties!inner(id, name)
        `);
      
      if (error) throw error;

      // تجميع البيانات حسب العقار
      const propertyData = requests.reduce((acc, req) => {
        const propertyId = req.properties.id;
        const propertyName = req.properties.name;
        
        if (!acc[propertyId]) {
          acc[propertyId] = {
            property_id: propertyId,
            property_name: propertyName,
            total_cost: 0,
            completed_count: 0,
            pending_count: 0,
            avg_cost: 0
          };
        }

        const cost = Number(req.actual_cost || req.estimated_cost || 0);
        acc[propertyId].total_cost += cost;
        if (req.status === 'مكتمل') {
          acc[propertyId].completed_count += 1;
        } else if (req.status === 'معلق') {
          acc[propertyId].pending_count += 1;
        }

        return acc;
      }, {} as Record<string, MaintenanceCostData>);

      // حساب المتوسط
      const result = Object.values(propertyData).map(item => ({
        ...item,
        avg_cost: item.completed_count > 0 ? item.total_cost / item.completed_count : 0
      }));

      return result.sort((a, b) => b.total_cost - a.total_cost);
    },
  });

  // تحليل حسب نوع الصيانة
  const { data: typeAnalysis } = useQuery({
    queryKey: ['maintenance-type-analysis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('category, estimated_cost, actual_cost, status');
      
      if (error) throw error;

      const typeData = data.reduce((acc, req) => {
        const category = req.category || 'غير محدد';
        if (!acc[category]) {
          acc[category] = { type: category, totalCost: 0, count: 0 };
        }
        const cost = Number(req.actual_cost || req.estimated_cost || 0);
        acc[category].totalCost += cost;
        acc[category].count += 1;
        return acc;
      }, {} as Record<string, any>);

      return Object.values(typeData).map((item: any) => ({
        name: item.type,
        value: item.totalCost,
        count: item.count
      }));
    },
  });

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

  const totalCost = maintenanceData?.reduce((sum, m) => sum + m.total_cost, 0) || 0;
  const totalCompleted = maintenanceData?.reduce((sum, m) => sum + m.completed_count, 0) || 0;
  const totalPending = maintenanceData?.reduce((sum, m) => sum + m.pending_count, 0) || 0;

  return (
    <div className="space-y-6">
      {/* إحصائيات إجمالية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">التكلفة الإجمالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCost.toLocaleString('ar-SA')} ريال</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">العمليات المكتملة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalCompleted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">العمليات المعلقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalPending}</div>
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
                  data={typeAnalysis}
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
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العقار</TableHead>
                  <TableHead>التكلفة الإجمالية</TableHead>
                  <TableHead>المكتمل</TableHead>
                  <TableHead>المعلق</TableHead>
                  <TableHead>متوسط التكلفة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceData?.map((maintenance) => (
                  <TableRow key={maintenance.property_id}>
                    <TableCell className="font-medium">{maintenance.property_name}</TableCell>
                    <TableCell className="font-bold">
                      {maintenance.total_cost.toLocaleString('ar-SA')} ريال
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{maintenance.completed_count}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{maintenance.pending_count}</Badge>
                    </TableCell>
                    <TableCell>
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
