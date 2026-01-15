/**
 * لوحة مراقبة أداء قاعدة البيانات - محسّنة
 * Database Performance Dashboard - Optimized
 * ✅ تحميل كسول للرسوم البيانية
 * ✅ عرض KPIs أولاً
 */

import { lazy, Suspense, memo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useDatabasePerformance } from "@/hooks/monitoring/useDatabasePerformance";
import { PerformanceKPICards } from "@/components/monitoring/PerformanceKPICards";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// ✅ تحميل كسول للمكونات الثقيلة (تحتوي recharts)
const SequentialScansChart = lazy(() => import("@/components/monitoring/SequentialScansChart"));
const CacheHitChart = lazy(() => import("@/components/monitoring/CacheHitChart"));
const ConnectionsChart = lazy(() => import("@/components/monitoring/ConnectionsChart"));
const TablesPerformanceTable = lazy(() => import("@/components/monitoring/TablesPerformanceTable"));
const PerformanceAlertsPanel = lazy(() => import("@/components/monitoring/PerformanceAlertsPanel"));

// ✅ Skeleton للرسوم البيانية
const ChartSkeleton = memo(function ChartSkeleton() {
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
});

// ✅ Skeleton للجدول
const TableSkeleton = memo(function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
});

export default function DatabasePerformanceDashboard() {
  const {
    stats,
    isLoading,
    refetch,
    lastUpdated,
    alerts,
    topSequentialScans,
  } = useDatabasePerformance();

  return (
    <div className="container-custom py-6 space-y-6 w-full max-w-full overflow-x-hidden">
      <PageHeader
        title="لوحة مراقبة أداء قاعدة البيانات"
        description="مراقبة Sequential Scans و Cache Hit Ratio والاتصالات النشطة"
      />

      {/* ✅ بطاقات KPI - تُحمَّل أولاً (أهم شيء) */}
      <PerformanceKPICards 
        stats={stats} 
        isLoading={isLoading}
        alertsCount={alerts.length}
      />

      {/* ✅ التنبيهات + Cache Hit - تحميل كسول */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <PerformanceAlertsPanel
            alerts={alerts}
            isLoading={isLoading}
            onRefresh={refetch}
            lastUpdated={lastUpdated}
          />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <CacheHitChart 
            ratio={stats?.cacheHitRatio || 0} 
            isLoading={isLoading} 
          />
        </Suspense>
      </div>

      {/* ✅ Sequential Scans + Connections - تحميل كسول */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <SequentialScansChart 
            data={topSequentialScans} 
            isLoading={isLoading} 
          />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <ConnectionsChart 
            connections={stats?.connections || []} 
            isLoading={isLoading} 
          />
        </Suspense>
      </div>

      {/* ✅ جدول الجداول - تحميل كسول */}
      <Suspense fallback={<TableSkeleton />}>
        <TablesPerformanceTable 
          tables={stats?.sequentialScans || []} 
          isLoading={isLoading} 
        />
      </Suspense>
    </div>
  );
}
