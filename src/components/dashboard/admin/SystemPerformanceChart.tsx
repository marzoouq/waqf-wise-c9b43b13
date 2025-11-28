import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, RefreshCw } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useSystemPerformanceMetrics } from "@/hooks/useSystemPerformanceMetrics";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function SystemPerformanceChart() {
  const { data, isLoading, error, refetch, isFetching } = useSystemPerformanceMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            أداء النظام (آخر 24 ساعة)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            أداء النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <p>حدث خطأ في تحميل البيانات</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-2">
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          أداء النظام (آخر 24 ساعة)
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="time" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="responseTime" 
              stroke="hsl(var(--primary))" 
              name="وقت الاستجابة (ms)"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="requests" 
              stroke="hsl(var(--chart-2))" 
              name="الطلبات"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="cpu" 
              stroke="hsl(var(--chart-3))" 
              name="استخدام CPU (%)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
