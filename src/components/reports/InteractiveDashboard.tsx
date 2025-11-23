import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Building2, DollarSign, Calendar } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { useDashboardKPIs } from '@/hooks/useDashboardKPIs';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function InteractiveDashboard() {
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

  // إحصائيات المستفيدين
  const { data: beneficiariesStats, isLoading: loadingBeneficiaries } = useQuery({
    queryKey: ['dashboard-beneficiaries', timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('category, status, created_at');
      
      if (error) throw error;
      
      // تجميع البيانات حسب الفئة
      const categoryCount = data.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(categoryCount).map(([name, value]) => ({
        name,
        value,
      }));
    },
  });

  // إحصائيات المدفوعات
  const { data: paymentsStats, isLoading: loadingPayments } = useQuery({
    queryKey: ['dashboard-payments', timeRange],
    queryFn: async () => {
      const startDate = new Date();
      if (timeRange === 'month') startDate.setMonth(startDate.getMonth() - 1);
      else if (timeRange === 'quarter') startDate.setMonth(startDate.getMonth() - 3);
      else startDate.setFullYear(startDate.getFullYear() - 1);

      const { data, error } = await supabase
        .from('payments')
        .select('amount, payment_date, payment_type')
        .gte('payment_date', startDate.toISOString());
      
      if (error) throw error;

      // تجميع البيانات حسب الشهر
      const monthlyData = data.reduce((acc, curr) => {
        const month = new Date(curr.payment_date).toLocaleDateString('ar-SA', { month: 'short' });
        if (!acc[month]) {
          acc[month] = { month, total: 0, count: 0 };
        }
        acc[month].total += Number(curr.amount);
        acc[month].count += 1;
        return acc;
      }, {} as Record<string, { month: string; total: number; count: number }>);

      return Object.values(monthlyData);
    },
  });

  // إحصائيات العقارات
  const { data: propertiesStats, isLoading: loadingProperties } = useQuery({
    queryKey: ['dashboard-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('status, type');
      
      if (error) throw error;

      const statusCount = data.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(statusCount).map(([name, value]) => ({
        name,
        value,
      }));
    },
  });

  // KPIs الرئيسية
  const { data: kpis, isLoading: loadingKPIs } = useDashboardKPIs();

  const isLoading = loadingBeneficiaries || loadingPayments || loadingProperties || loadingKPIs;

  if (isLoading) {
    return <LoadingState message="جاري تحميل البيانات..." />;
  }

  return (
    <div className="space-y-6">
      {/* أدوات التحكم */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">الشهر الماضي</SelectItem>
              <SelectItem value="quarter">آخر 3 أشهر</SelectItem>
              <SelectItem value="year">السنة الماضية</SelectItem>
            </SelectContent>
          </Select>

          <Select value={chartType} onValueChange={(v) => setChartType(v as 'bar' | 'line' | 'pie')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="نوع الرسم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">رسم بياني عمودي</SelectItem>
              <SelectItem value="line">رسم بياني خطي</SelectItem>
              <SelectItem value="pie">رسم دائري</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستفيدين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.beneficiaries.toLocaleString('ar-SA')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">العقارات</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.properties.toLocaleString('ar-SA')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المدفوعات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.totalPayments.toLocaleString('ar-SA')} ريال</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">العقود النشطة</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.activeContracts.toLocaleString('ar-SA')}</div>
          </CardContent>
        </Card>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* المدفوعات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              المدفوعات حسب الفترة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'bar' ? (
                <BarChart data={paymentsStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#8884d8" name="المجموع" />
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={paymentsStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" name="المجموع" />
                </LineChart>
              ) : (
                <PieChart>
                  <Pie
                    data={paymentsStats}
                    dataKey="total"
                    nameKey="month"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {paymentsStats?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* المستفيدون حسب الفئة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              المستفيدون حسب الفئة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={beneficiariesStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {beneficiariesStats?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* العقارات حسب الحالة */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              العقارات حسب الحالة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={propertiesStats}>
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
    </div>
  );
}
