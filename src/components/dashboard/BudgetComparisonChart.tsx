import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { BudgetComparison } from "@/types/dashboard";

const BudgetComparisonChart = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BudgetComparison[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchBudgetComparison();
    
    // Real-time subscription
    const channel = supabase
      .channel('budgets-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'budgets'
      }, () => {
        fetchBudgetComparison();
        queryClient.invalidateQueries({ queryKey: ["budgets"] });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const fetchBudgetComparison = async () => {
    try {
      const { data: budgets, error } = await supabase
        .from("budgets")
        .select(`
          budgeted_amount,
          actual_amount,
          variance_amount,
          accounts!inner (
            name_ar
          )
        `)
        .limit(10);

      if (error) throw error;

      interface BudgetData {
        accounts: {
          name_ar: string;
        };
        budgeted_amount: number;
        actual_amount: number;
        variance_amount: number;
      }

      const chartData: BudgetComparison[] = budgets?.map((budget: BudgetData) => ({
        account: budget.accounts.name_ar.substring(0, 15) + '...',
        budgeted: Number(budget.budgeted_amount || 0),
        actual: Number(budget.actual_amount || 0),
        variance: Number(budget.variance_amount || 0),
      })) || [];

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

  if (data.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-xl font-bold">مقارنة الميزانيات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            لا توجد بيانات ميزانيات متاحة
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-xl font-bold">مقارنة الميزانيات (المخطط مقابل الفعلي)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="account" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '11px' }}
              angle={-45}
              textAnchor="end"
              height={80}
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
              formatter={(value) => {
                const labels: Record<string, string> = {
                  budgeted: 'المخطط',
                  actual: 'الفعلي',
                };
                return labels[value] || value;
              }}
            />
            <Bar dataKey="budgeted" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BudgetComparisonChart;
