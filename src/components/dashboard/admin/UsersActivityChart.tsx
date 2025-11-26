import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export function UsersActivityChart() {
  // بيانات محاكاة لنشاط المستخدمين
  const data = [
    { day: 'السبت', activeUsers: 45, newUsers: 5, logins: 120 },
    { day: 'الأحد', activeUsers: 52, newUsers: 8, logins: 145 },
    { day: 'الاثنين', activeUsers: 48, newUsers: 3, logins: 132 },
    { day: 'الثلاثاء', activeUsers: 55, newUsers: 7, logins: 158 },
    { day: 'الأربعاء', activeUsers: 50, newUsers: 4, logins: 140 },
    { day: 'الخميس', activeUsers: 42, newUsers: 6, logins: 115 },
    { day: 'الجمعة', activeUsers: 38, newUsers: 2, logins: 95 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          نشاط المستخدمين (آخر 7 أيام)
        </CardTitle>
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
