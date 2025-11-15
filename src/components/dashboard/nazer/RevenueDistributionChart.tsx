import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import type { RevenueDistribution } from "@/types/dashboard";
import { ChartSkeleton } from "@/components/shared/ChartSkeleton";

export default function RevenueDistributionChart() {
  const [data, setData] = useState<RevenueDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();

    const channel = supabase
      .channel('revenue-distribution')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_entry_lines' }, fetchRevenueData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRevenueData = async () => {
    setIsLoading(true);

    const { data: revenueData } = await supabase
      .from('journal_entry_lines')
      .select(`
        credit_amount,
        debit_amount,
        accounts!inner(name_ar)
      `)
      .eq('accounts.account_type', 'revenue')
      .limit(50);  // فقط آخر 50 سجل

    const revenueByType: { [key: string]: number } = {};

    if (revenueData) {
      revenueData.forEach(line => {
        const accountName = line.accounts?.name_ar || 'غير محدد';
        const amount = (line.credit_amount || 0) - (line.debit_amount || 0);
        
        if (!revenueByType[accountName]) {
          revenueByType[accountName] = 0;
        }
        revenueByType[accountName] += amount;
      });
    }

    const chartData = Object.entries(revenueByType)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
        percentage: 0
      }));

    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    chartData.forEach(item => {
      item.percentage = total > 0 ? (item.value / total) * 100 : 0;
    });

    setData(chartData);
    setIsLoading(false);
  };

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  if (isLoading) {
    return <ChartSkeleton title="توزيع الإيرادات" />;
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>توزيع الإيرادات</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">لا توجد بيانات إيرادات</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>توزيع الإيرادات حسب المصدر</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data as any}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => `${value.toLocaleString('ar-SA')} ر.س`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
