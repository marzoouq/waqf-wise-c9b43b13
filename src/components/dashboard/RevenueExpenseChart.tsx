import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface MonthlyData {
  month: string;
  revenue: number;
  expense: number;
}

const RevenueExpenseChart = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  const fetchMonthlyData = async () => {
    try {
      const { data: entries, error } = await supabase
        .from("journal_entry_lines")
        .select(`
          debit_amount,
          credit_amount,
          journal_entries!inner (
            entry_date
          ),
          accounts!inner (
            account_type,
            account_nature
          )
        `)
        .order('journal_entries(entry_date)', { ascending: true });

      if (error) throw error;

      // Group by month
      const monthlyMap = new Map<string, { revenue: number; expense: number }>();

      entries?.forEach((line: any) => {
        const date = new Date(line.journal_entries.entry_date);
        const monthKey = date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' });
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { revenue: 0, expense: 0 });
        }

        const monthData = monthlyMap.get(monthKey)!;
        const accountType = line.accounts.account_type;
        const accountNature = line.accounts.account_nature;
        const debit = Number(line.debit_amount || 0);
        const credit = Number(line.credit_amount || 0);

        if (accountType === 'revenue') {
          monthData.revenue += accountNature === 'credit' ? credit - debit : debit - credit;
        } else if (accountType === 'expense') {
          monthData.expense += accountNature === 'debit' ? debit - credit : credit - debit;
        }
      });

      const chartData: MonthlyData[] = Array.from(monthlyMap.entries()).map(([month, values]) => ({
        month,
        revenue: values.revenue,
        expense: values.expense,
      }));

      setData(chartData);
    } catch (error) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full shadow-soft">
      <CardHeader>
        <CardTitle className="text-xl font-bold">الإيرادات والمصروفات الشهرية</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                direction: 'rtl',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [
                new Intl.NumberFormat('ar-SA', {
                  style: 'currency',
                  currency: 'SAR',
                  minimumFractionDigits: 0,
                }).format(value),
              ]}
            />
            <Legend 
              wrapperStyle={{ direction: 'rtl', paddingTop: '10px' }}
              formatter={(value) => value === 'revenue' ? 'الإيرادات' : 'المصروفات'}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExpense)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueExpenseChart;
