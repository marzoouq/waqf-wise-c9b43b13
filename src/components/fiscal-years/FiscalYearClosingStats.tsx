/**
 * بطاقات إحصائيات الإقفال
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FiscalYearClosingStatsProps {
  totalRevenues: number;
  totalExpenses: number;
  netIncome: number;
  waqfCorpus: number;
  nazerShare: number;
  waqifShare: number;
}

export function FiscalYearClosingStats({
  totalRevenues,
  totalExpenses,
  netIncome,
  waqfCorpus,
  nazerShare,
  waqifShare,
}: FiscalYearClosingStatsProps) {
  const stats = [
    {
      title: "إجمالي الإيرادات",
      value: formatCurrency(totalRevenues),
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "إجمالي المصروفات",
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "صافي الدخل",
      value: formatCurrency(netIncome),
      icon: DollarSign,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "رقبة الوقف",
      value: formatCurrency(waqfCorpus),
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "حصة الناظر",
      value: formatCurrency(nazerShare),
      icon: Percent,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "حصة الواقف",
      value: formatCurrency(waqifShare),
      icon: Percent,
      color: "text-accent-foreground",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
