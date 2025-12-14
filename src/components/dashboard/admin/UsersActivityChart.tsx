import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, RefreshCw } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useUsersActivityMetrics } from "@/hooks/useUsersActivityMetrics";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { CHART_CONSTANTS } from "@/lib/constants";

export function UsersActivityChart() {
  const { data, isLoading, isError, refetch, isFetching } = useUsersActivityMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            نشاط المستخدمين (آخر 7 أيام)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            نشاط المستخدمين
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ErrorState 
            title="خطأ في تحميل بيانات النشاط"
            onRetry={refetch}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          نشاط المستخدمين (آخر 7 أيام)
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
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="day" 
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
            <Bar 
              dataKey="activeUsers" 
              fill="hsl(var(--primary))" 
              name="مستخدمين نشطين"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="newUsers" 
              fill="hsl(var(--chart-2))" 
              name="مستخدمين جدد"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="logins" 
              fill="hsl(var(--chart-3))" 
              name="عمليات دخول"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
