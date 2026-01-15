/**
 * رسم بياني للـ Sequential Scans
 * Sequential Scans Bar Chart
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { TableScanStats } from "@/services/monitoring/db-performance.service";

interface SequentialScansChartProps {
  data: TableScanStats[];
  isLoading: boolean;
}

export function SequentialScansChart({ data, isLoading }: SequentialScansChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.slice(0, 10).map(item => ({
    name: item.table_name.replace('public.', ''),
    seqScan: item.seq_scan,
    idxScan: item.idx_scan,
    seqPct: item.seq_pct,
    displayValue: item.seq_scan > 1000000 
      ? `${(item.seq_scan / 1000000).toFixed(1)}M`
      : item.seq_scan > 1000 
      ? `${(item.seq_scan / 1000).toFixed(0)}K`
      : item.seq_scan.toString(),
  }));

  const getBarColor = (pct: number) => {
    if (pct >= 90) return 'hsl(var(--destructive))';
    if (pct >= 70) return 'hsl(var(--warning))';
    return 'hsl(var(--success))';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sequential Scans لكل جدول</CardTitle>
        <CardDescription>
          أعلى 10 جداول من حيث عدد Sequential Scans (نسبة عالية = أداء ضعيف)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <XAxis type="number" tickFormatter={(v) => 
              v > 1000000 ? `${(v/1000000).toFixed(1)}M` : 
              v > 1000 ? `${(v/1000).toFixed(0)}K` : v
            } />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={90}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                value.toLocaleString(),
                name === 'seqScan' ? 'Sequential Scans' : 'Index Scans'
              ]}
              labelFormatter={(label) => `جدول: ${label}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                direction: 'rtl',
              }}
            />
            <Bar dataKey="seqScan" name="Sequential Scans" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.seqPct)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span>&lt; 70%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span>70-90%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span>&gt; 90%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SequentialScansChart;
