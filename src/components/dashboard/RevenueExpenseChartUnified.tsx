import { UnifiedChart, ChartDataPoint } from "@/components/unified/UnifiedChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

export function RevenueExpenseChartUnified() {
  const { data: journalEntries } = useQuery({
    queryKey: ['journal-entries-chart'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('entry_date', { ascending: true })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
  });

  // جلب بيانات القيود مع التفاصيل
  const { data: journalEntriesWithLines } = useQuery({
    queryKey: ['journal-entries-with-lines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journal_entries')
        .select(`
          *,
          journal_entry_lines (
            amount,
            entry_type,
            account_id,
            accounts (
              account_type,
              account_nature
            )
          )
        `)
        .eq('status', 'posted')
        .order('entry_date', { ascending: true })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
  });

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!journalEntriesWithLines || journalEntriesWithLines.length === 0) return [];

    // تجميع البيانات حسب الشهر
    const monthlyData: Record<string, { revenue: number; expense: number }> = {};

    journalEntriesWithLines.forEach((entry: any) => {
      const date = new Date(entry.entry_date);
      const monthName = date.toLocaleDateString('ar-SA', { month: 'long' });
      
      if (!monthlyData[monthName]) {
        monthlyData[monthName] = { revenue: 0, expense: 0 };
      }

      // جمع المبالغ من journal_entry_lines
      entry.journal_entry_lines?.forEach((line: any) => {
        const amount = Math.abs(line.amount);
        
        // تصنيف حسب نوع الحساب
        if (line.accounts?.account_type === 'revenue') {
          monthlyData[monthName].revenue += amount;
        } else if (line.accounts?.account_type === 'expense') {
          monthlyData[monthName].expense += amount;
        }
      });
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue),
      expense: Math.round(data.expense),
    }));
  }, [journalEntriesWithLines]);

  return (
    <UnifiedChart
      title="الإيرادات والمصروفات"
      description="مقارنة شهرية للإيرادات والمصروفات"
      type="bar"
      data={chartData}
      series={[
        { dataKey: "revenue", name: "الإيرادات", color: "hsl(var(--chart-2))" },
        { dataKey: "expense", name: "المصروفات", color: "hsl(var(--chart-3))" },
      ]}
      xAxisKey="month"
      height={350}
    />
  );
}
