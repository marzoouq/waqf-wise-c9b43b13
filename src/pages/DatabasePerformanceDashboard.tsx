/**
 * لوحة مراقبة أداء قاعدة البيانات
 * Database Performance Dashboard
 */

import { PageHeader } from "@/components/layout/PageHeader";
import { useDatabasePerformance } from "@/hooks/monitoring/useDatabasePerformance";
import { PerformanceKPICards } from "@/components/monitoring/PerformanceKPICards";
import { SequentialScansChart } from "@/components/monitoring/SequentialScansChart";
import { CacheHitChart } from "@/components/monitoring/CacheHitChart";
import { ConnectionsChart } from "@/components/monitoring/ConnectionsChart";
import { TablesPerformanceTable } from "@/components/monitoring/TablesPerformanceTable";
import { PerformanceAlertsPanel } from "@/components/monitoring/PerformanceAlertsPanel";

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

      {/* بطاقات KPI */}
      <PerformanceKPICards 
        stats={stats} 
        isLoading={isLoading}
        alertsCount={alerts.length}
      />

      {/* التنبيهات + Cache Hit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceAlertsPanel
          alerts={alerts}
          isLoading={isLoading}
          onRefresh={refetch}
          lastUpdated={lastUpdated}
        />
        <CacheHitChart 
          ratio={stats?.cacheHitRatio || 0} 
          isLoading={isLoading} 
        />
      </div>

      {/* Sequential Scans + Connections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SequentialScansChart 
          data={topSequentialScans} 
          isLoading={isLoading} 
        />
        <ConnectionsChart 
          connections={stats?.connections || []} 
          isLoading={isLoading} 
        />
      </div>

      {/* جدول الجداول */}
      <TablesPerformanceTable 
        tables={stats?.sequentialScans || []} 
        isLoading={isLoading} 
      />
    </div>
  );
}
