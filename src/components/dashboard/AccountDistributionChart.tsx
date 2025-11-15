import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useQueryClient } from "@tanstack/react-query";

interface AccountData {
  name: string;
  value: number;
  count: number;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const AccountDistributionChart = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AccountData[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchAccountDistribution();
    
    // Real-time subscription
    const channel = supabase
      .channel('accounts-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'accounts'
      }, () => {
        fetchAccountDistribution();
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const fetchAccountDistribution = async () => {
    try {
      const { data: accounts, error } = await supabase
        .from("accounts")
        .select("account_type")
        .eq("is_active", true);

      if (error) throw error;

      // Count accounts by type
      const distribution = new Map<string, number>();
      accounts?.forEach((account) => {
        const type = account.account_type;
        distribution.set(type, (distribution.get(type) || 0) + 1);
      });

      const typeLabels: Record<string, string> = {
        asset: 'الأصول',
        liability: 'الخصوم',
        equity: 'حقوق الملكية',
        revenue: 'الإيرادات',
        expense: 'المصروفات',
      };

      const chartData: AccountData[] = Array.from(distribution.entries()).map(([type, count]) => ({
        name: typeLabels[type] || type,
        value: count,
        count: count,
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
      <Card>
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
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-xl font-bold">توزيع الحسابات حسب النوع</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data as any}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                direction: 'rtl',
              }}
              formatter={(value: number, name: string) => [`${value} حساب`, name]}
            />
            <Legend 
              wrapperStyle={{ direction: 'rtl', paddingTop: '10px' }}
              formatter={(value) => value}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AccountDistributionChart;
