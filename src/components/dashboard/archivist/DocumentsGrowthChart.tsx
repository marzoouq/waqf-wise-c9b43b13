/**
 * رسم بياني لنمو المستندات بمرور الوقت
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export function DocumentsGrowthChart() {
  const { data: growthData, isLoading } = useQuery({
    queryKey: ["documents-growth-chart"],
    queryFn: async () => {
      // جلب المستندات مجمعة حسب الشهر
      const { data, error } = await supabase
        .from("documents")
        .select("uploaded_at")
        .order("uploaded_at", { ascending: true });

      if (error) throw error;

      // تجميع حسب الشهر
      const monthlyData: Record<string, number> = {};
      const documents = data || [];

      documents.forEach((doc) => {
        const date = new Date(doc.uploaded_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      });

      // تحويل لمصفوفة مرتبة
      const sortedMonths = Object.keys(monthlyData).sort();
      let cumulative = 0;

      return sortedMonths.map((month) => {
        cumulative += monthlyData[month];
        const [year, m] = month.split("-");
        const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        return {
          month: `${monthNames[parseInt(m) - 1]} ${year}`,
          count: monthlyData[month],
          cumulative,
        };
      }).slice(-12); // آخر 12 شهر
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            نمو المستندات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          نمو المستندات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                name="إجمالي المستندات"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.2)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="مستندات جديدة"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2) / 0.2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
