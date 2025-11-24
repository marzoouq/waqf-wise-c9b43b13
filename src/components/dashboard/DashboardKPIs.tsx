import { Card, CardContent } from "@/components/ui/card";
import { Users, Home, DollarSign, TrendingUp } from "lucide-react";

interface KPI {
  title: string;
  value: string;
  icon: typeof Users;
  trend?: string;
  trendColor?: "text-green-600" | "text-red-600";
}

interface DashboardKPIsProps {
  kpis: KPI[];
}

/**
 * مكون عرض مؤشرات الأداء الرئيسية (KPIs)
 * يعرض البطاقات في شبكة responsive
 */
export function DashboardKPIs({ kpis }: DashboardKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </p>
                  <h3 className="text-2xl font-bold mt-2">{kpi.value}</h3>
                  {kpi.trend && (
                    <p className={`text-xs mt-1 ${kpi.trendColor}`}>
                      {kpi.trend}
                    </p>
                  )}
                </div>
                <Icon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
