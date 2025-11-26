import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export type ChartType = "line" | "bar" | "area" | "pie";

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface ChartSeries {
  dataKey: string;
  name: string;
  color?: string;
}

interface UnifiedChartProps {
  title?: string;
  description?: string;
  type: ChartType;
  data: ChartDataPoint[];
  series: ChartSeries[];
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  colors?: string[];
  className?: string;
}

const DEFAULT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

/**
 * مكون رسوم بيانية موحد
 * يدعم أنواع متعددة: خطي، أعمدة، مساحة، دائري
 * 
 * @example
 * <UnifiedChart
 *   title="الإيرادات الشهرية"
 *   type="bar"
 *   data={monthlyData}
 *   series={[{ dataKey: "revenue", name: "الإيرادات" }]}
 *   xAxisKey="month"
 * />
 */
export function UnifiedChart({
  title,
  description,
  type,
  data,
  series,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  colors = DEFAULT_COLORS,
  className,
}: UnifiedChartProps) {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case "line":
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
            {xAxisKey && <XAxis dataKey={xAxisKey} stroke="hsl(var(--muted-foreground))" />}
            <YAxis stroke="hsl(var(--muted-foreground))" />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />}
            {showLegend && <Legend />}
            {series.map((s, i) => (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color || colors[i % colors.length]}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
            {xAxisKey && <XAxis dataKey={xAxisKey} stroke="hsl(var(--muted-foreground))" />}
            <YAxis stroke="hsl(var(--muted-foreground))" />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />}
            {showLegend && <Legend />}
            {series.map((s, i) => (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name}
                fill={s.color || colors[i % colors.length]}
              />
            ))}
          </BarChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
            {xAxisKey && <XAxis dataKey={xAxisKey} stroke="hsl(var(--muted-foreground))" />}
            <YAxis stroke="hsl(var(--muted-foreground))" />
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />}
            {showLegend && <Legend />}
            {series.map((s, i) => (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color || colors[i % colors.length]}
                fill={s.color || colors[i % colors.length]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        );

      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={series[0]?.dataKey}
              nameKey={xAxisKey || "name"}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {showTooltip && <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />}
            {showLegend && <Legend />}
          </PieChart>
        );
    }
  };

  const content = (
    <ResponsiveContainer width="100%" height={height}>
      {renderChart()}
    </ResponsiveContainer>
  );

  if (title || description) {
    return (
      <Card className={className}>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return <div className={className}>{content}</div>;
}
