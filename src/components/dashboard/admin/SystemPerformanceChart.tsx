import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export function SystemPerformanceChart() {
  // بيانات محاكاة للأداء
  const data = [
    { time: '00:00', responseTime: 120, requests: 45, cpu: 35 },
    { time: '04:00', responseTime: 95, requests: 32, cpu: 28 },
    { time: '08:00', responseTime: 180, requests: 78, cpu: 52 },
    { time: '12:00', responseTime: 220, requests: 95, cpu: 68 },
    { time: '16:00', responseTime: 210, requests: 88, cpu: 65 },
    { time: '20:00', responseTime: 165, requests: 62, cpu: 45 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          أداء النظام (آخر 24 ساعة)
        </CardTitle>
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
