/**
 * بطاقات KPI لصحة قاعدة البيانات
 * Database Health KPI Cards
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Layers, Shield, AlertTriangle, HardDrive, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { HealthSummary } from "@/services/monitoring/db-health.service";

interface HealthKPICardsProps {
  summary: HealthSummary | undefined;
  alertsCount: number;
  isLoading: boolean;
}

export function HealthKPICards({ summary, alertsCount, isLoading }: HealthKPICardsProps) {
  const kpis = [
    {
      title: 'الجداول',
      value: summary?.total_tables || 0,
      icon: Database,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'الفهارس',
      value: summary?.total_indexes || 0,
      subtitle: summary?.duplicate_indexes ? `${summary.duplicate_indexes} مكرر` : undefined,
      icon: Layers,
      color: summary?.duplicate_indexes ? 'text-yellow-500' : 'text-green-500',
      bgColor: summary?.duplicate_indexes ? 'bg-yellow-500/10' : 'bg-green-500/10',
    },
    {
      title: 'سياسات RLS',
      value: summary?.duplicate_policies || 0,
      subtitle: 'مكررة',
      icon: Shield,
      color: summary?.duplicate_policies ? 'text-yellow-500' : 'text-green-500',
      bgColor: summary?.duplicate_policies ? 'bg-yellow-500/10' : 'bg-green-500/10',
    },
    {
      title: 'الصفوف الميتة',
      value: summary?.total_dead_rows?.toLocaleString() || '0',
      subtitle: `${summary?.tables_with_dead_rows || 0} جدول`,
      icon: AlertTriangle,
      color: (summary?.total_dead_rows || 0) > 10000 ? 'text-red-500' : 'text-green-500',
      bgColor: (summary?.total_dead_rows || 0) > 10000 ? 'bg-red-500/10' : 'bg-green-500/10',
    },
    {
      title: 'حجم قاعدة البيانات',
      value: `${summary?.db_size_mb?.toFixed(1) || 0} MB`,
      icon: HardDrive,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Cache Hit',
      value: `${summary?.cache_hit_ratio?.toFixed(1) || 0}%`,
      icon: Zap,
      color: (summary?.cache_hit_ratio || 0) >= 95 ? 'text-green-500' : 'text-yellow-500',
      bgColor: (summary?.cache_hit_ratio || 0) >= 95 ? 'bg-green-500/10' : 'bg-yellow-500/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className={kpi.bgColor}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Icon className={`h-4 w-4 ${kpi.color}`} />
                {kpi.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${kpi.color}`}>
                {kpi.value}
              </div>
              {kpi.subtitle && (
                <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
