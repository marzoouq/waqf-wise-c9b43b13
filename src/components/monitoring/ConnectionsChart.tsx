/**
 * رسم بياني للاتصالات النشطة
 * Active Connections Chart
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import type { ConnectionStats } from "@/services/monitoring/db-performance.service";

interface ConnectionsChartProps {
  connections: ConnectionStats[];
  isLoading: boolean;
}

export function ConnectionsChart({ connections, isLoading }: ConnectionsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = connections.map(conn => ({
    name: conn.state === 'active' ? 'نشط' : 
          conn.state === 'idle' ? 'خامل' : 
          conn.state === 'idle in transaction' ? 'خامل في معاملة' : conn.state,
    value: conn.count,
    maxIdleHours: Math.floor(conn.max_idle_seconds / 3600),
    originalState: conn.state,
  }));

  const COLORS = [
    'hsl(var(--success))',
    'hsl(var(--warning))',
    'hsl(var(--destructive))',
    'hsl(var(--muted))',
  ];

  const totalConnections = chartData.reduce((sum, c) => sum + c.value, 0);
  const idleConn = connections.find(c => c.state === 'idle');
  const maxIdleHours = idleConn ? Math.floor(idleConn.max_idle_seconds / 3600) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>الاتصالات النشطة</span>
          <Badge variant="outline">{totalConnections} اتصال</Badge>
        </CardTitle>
        <CardDescription>
          توزيع الاتصالات حسب الحالة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [value, 'اتصال']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  direction: 'rtl',
                }}
              />
              <Legend 
                verticalAlign="bottom"
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {maxIdleHours > 24 && (
          <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-2 text-warning">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                أقدم اتصال خامل: {maxIdleHours} ساعة ({Math.floor(maxIdleHours / 24)} يوم)
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {chartData.map((conn, index) => (
            <div key={conn.originalState} className="flex items-center justify-between p-2 rounded bg-muted/50">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{conn.name}</span>
              </div>
              <span className="font-medium">{conn.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
