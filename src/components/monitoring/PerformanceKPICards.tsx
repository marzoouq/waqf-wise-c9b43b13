/**
 * بطاقات KPI لأداء قاعدة البيانات
 * Performance KPI Cards
 */

import { Database, Activity, Zap, AlertTriangle, HardDrive, Users } from "lucide-react";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import type { DBPerformanceStats } from "@/services/monitoring/db-performance.service";

interface PerformanceKPICardsProps {
  stats: DBPerformanceStats | undefined;
  isLoading: boolean;
  alertsCount: number;
}

export function PerformanceKPICards({ stats, isLoading, alertsCount }: PerformanceKPICardsProps) {
  const cacheHitVariant = !stats ? 'default' : 
    stats.cacheHitRatio >= 99 ? 'success' : 
    stats.cacheHitRatio >= 95 ? 'warning' : 'destructive';

  const totalSeqScans = stats?.sequentialScans.reduce((sum, t) => sum + t.seq_scan, 0) || 0;
  
  const activeConnections = stats?.connections.find(c => c.state === 'active')?.count || 0;
  const idleConnections = stats?.connections.find(c => c.state === 'idle')?.count || 0;
  const totalConnections = activeConnections + idleConnections;

  const deadRowsVariant = !stats ? 'default' :
    stats.totalDeadRows > 10000 ? 'destructive' :
    stats.totalDeadRows > 1000 ? 'warning' : 'success';

  return (
    <UnifiedStatsGrid columns={3}>
      <UnifiedKPICard
        title="Cache Hit Ratio"
        value={stats ? `${stats.cacheHitRatio.toFixed(2)}%` : '-'}
        icon={Zap}
        variant={cacheHitVariant}
        loading={isLoading}
        subtitle={stats?.cacheHitRatio >= 99 ? 'ممتاز' : stats?.cacheHitRatio >= 95 ? 'جيد' : 'يحتاج تحسين'}
      />
      
      <UnifiedKPICard
        title="Sequential Scans"
        value={totalSeqScans > 1000000 
          ? `${(totalSeqScans / 1000000).toFixed(2)}M`
          : totalSeqScans > 1000 
          ? `${(totalSeqScans / 1000).toFixed(1)}K`
          : totalSeqScans.toString()}
        icon={Database}
        variant="default"
        loading={isLoading}
        subtitle={`${stats?.sequentialScans.length || 0} جدول`}
      />
      
      <UnifiedKPICard
        title="الاتصالات"
        value={`${activeConnections}/${totalConnections}`}
        icon={Users}
        variant={idleConnections > 10 ? 'warning' : 'success'}
        loading={isLoading}
        subtitle={`${idleConnections} خامل`}
      />
      
      <UnifiedKPICard
        title="Dead Rows"
        value={stats?.totalDeadRows.toLocaleString() || '0'}
        icon={AlertTriangle}
        variant={deadRowsVariant}
        loading={isLoading}
        subtitle={stats?.totalDeadRows === 0 ? 'نظيف' : 'يحتاج تنظيف'}
      />
      
      <UnifiedKPICard
        title="حجم قاعدة البيانات"
        value={stats ? `${stats.dbSizeMb.toFixed(1)} MB` : '-'}
        icon={HardDrive}
        variant="default"
        loading={isLoading}
      />
      
      <UnifiedKPICard
        title="التنبيهات"
        value={alertsCount.toString()}
        icon={Activity}
        variant={alertsCount > 0 ? 'destructive' : 'success'}
        loading={isLoading}
        subtitle={alertsCount === 0 ? 'لا توجد تنبيهات' : 'تحتاج انتباه'}
      />
    </UnifiedStatsGrid>
  );
}
