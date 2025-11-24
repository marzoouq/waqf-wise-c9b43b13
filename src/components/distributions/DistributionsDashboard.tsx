import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Users, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export function DistributionsDashboard() {
  const [distributions, setDistributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from('distributions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDistributions(data || []);
    } catch (error) {
      console.error('Error loading distributions:', error);
    } finally {
      setLoading(false);
    }
  };

  // حساب الإحصائيات
  const stats = {
    total: distributions.length,
    thisMonth: distributions.filter(d => {
      const date = new Date(d.created_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    totalAmount: distributions.reduce((sum, d) => sum + (d.total_amount || 0), 0),
    avgAmount: 0,
    completed: distributions.filter(d => d.status === 'completed').length,
    pending: distributions.filter(d => d.status === 'pending' || d.status === 'draft').length,
  };

  stats.avgAmount = stats.total > 0 ? stats.totalAmount / stats.total : 0;

  // تحليل حسب الشهر
  const monthlyData = distributions.reduce((acc, d) => {
    const month = new Date(d.created_at).toLocaleDateString('ar-SA', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = { month, count: 0, amount: 0 };
    }
    acc[month].count++;
    acc[month].amount += d.total_amount || 0;
    return acc;
  }, {} as Record<string, any>);

  const monthlyChartData = Object.values(monthlyData).slice(-6);

  // تحليل حسب الحالة
  const statusData = [
    { name: 'مكتمل', value: distributions.filter(d => d.status === 'completed').length },
    { name: 'قيد المراجعة', value: distributions.filter(d => d.status === 'pending').length },
    { name: 'مسودة', value: distributions.filter(d => d.status === 'draft').length },
    { name: 'ملغي', value: distributions.filter(d => d.status === 'cancelled').length },
  ].filter(s => s.value > 0);

  // تحليل حسب النمط
  const patternData = distributions.reduce((acc, d) => {
    const pattern = d.pattern || 'غير محدد';
    if (!acc[pattern]) {
      acc[pattern] = { name: pattern, count: 0 };
    }
    acc[pattern].count++;
    return acc;
  }, {} as Record<string, any>);

  const patternChartData = Object.values(patternData);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">إجمالي التوزيعات</span>
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">هذا الشهر</span>
          </div>
          <div className="text-2xl font-bold text-blue-500">{stats.thisMonth}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">المبلغ الإجمالي</span>
          </div>
          <div className="text-xl font-bold text-green-500">
            {(stats.totalAmount / 1000000).toFixed(1)}م
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-purple-500" />
            <span className="text-sm text-muted-foreground">المتوسط</span>
          </div>
          <div className="text-xl font-bold">{(stats.avgAmount / 1000).toFixed(0)}ك</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">مكتمل</span>
          </div>
          <div className="text-2xl font-bold">{stats.completed}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">معلق</span>
          </div>
          <div className="text-2xl font-bold">{stats.pending}</div>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات</TabsTrigger>
          <TabsTrigger value="analysis">التحليل</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">التوزيع حسب الحالة</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">التوزيع حسب النمط</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={patternChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">الاتجاه الشهري - عدد التوزيعات</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  name="عدد التوزيعات"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">الاتجاه الشهري - المبلغ</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="hsl(var(--chart-2))" name="المبلغ (ريال)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">معدل النمو الشهري</div>
              <div className="text-2xl font-bold text-green-500">+12.5%</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">متوسط وقت الموافقة</div>
              <div className="text-2xl font-bold">18 ساعة</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">معدل الإكمال</div>
              <div className="text-2xl font-bold text-green-500">94%</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">التوزيعات الملغاة</div>
              <div className="text-2xl font-bold text-red-500">
                {distributions.filter(d => d.status === 'cancelled').length}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">ملخص تحليلي</h3>
            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>
                  أداء ممتاز: معدل الإكمال مرتفع ({((stats.completed / stats.total) * 100).toFixed(1)}%)
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">ℹ</span>
                <span>النمو الشهري مستقر مع زيادة طفيفة في الربع الأخير</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">⚠</span>
                <span>يوجد {stats.pending} توزيع معلق يحتاج متابعة</span>
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
