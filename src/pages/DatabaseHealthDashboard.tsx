/**
 * لوحة مراقبة صحة قاعدة البيانات الشاملة
 * Comprehensive Database Health Monitoring Dashboard
 */

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useDatabaseHealth } from "@/hooks/monitoring/useDatabaseHealth";
import { HealthScoreCard } from "@/components/monitoring/HealthScoreCard";
import { HealthKPICards } from "@/components/monitoring/HealthKPICards";
import { HealthAlertsPanel } from "@/components/monitoring/HealthAlertsPanel";
import { DuplicateIndexesTable } from "@/components/monitoring/DuplicateIndexesTable";
import { DuplicatePoliciesTable } from "@/components/monitoring/DuplicatePoliciesTable";
import { DeadRowsTable } from "@/components/monitoring/DeadRowsTable";
import { QueryErrorsLog } from "@/components/monitoring/QueryErrorsLog";

export default function DatabaseHealthDashboard() {
  const {
    report,
    isLoading,
    refetch,
    lastUpdated,
    alerts,
    healthScore,
    healthStatus,
    runVacuumAll,
    isRunningVacuumAll,
    runVacuumTable,
    isRunningVacuumTable,
  } = useDatabaseHealth();

  return (
    <div className="container-custom py-6 space-y-6 w-full max-w-full overflow-x-hidden">
      <PageHeader
        title="لوحة صحة قاعدة البيانات"
        description="مراقبة شاملة لصحة قاعدة البيانات: الفهارس المكررة، سياسات RLS، الصفوف الميتة، وأخطاء الاستعلامات"
        action={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
            <Button 
              onClick={() => runVacuumAll()}
              disabled={isRunningVacuumAll}
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${isRunningVacuumAll ? 'animate-spin' : ''}`} />
              VACUUM ANALYZE
            </Button>
          </div>
        }
      />

      {/* نتيجة الصحة + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <HealthScoreCard 
          score={healthScore} 
          status={healthStatus as 'excellent' | 'good' | 'warning' | 'critical'}
          isLoading={isLoading}
        />
        <div className="lg:col-span-3">
          <HealthKPICards 
            summary={report?.summary} 
            alertsCount={alerts.length}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* التنبيهات + أخطاء الاستعلامات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthAlertsPanel
          alerts={alerts}
          isLoading={isLoading}
          onRefresh={refetch}
          lastUpdated={lastUpdated}
        />
        <QueryErrorsLog
          errors={report?.queryErrors || []}
          isLoading={isLoading}
        />
      </div>

      {/* الفهارس المكررة + سياسات RLS المكررة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DuplicateIndexesTable
          indexes={report?.duplicateIndexes || []}
          isLoading={isLoading}
        />
        <DuplicatePoliciesTable
          policies={report?.duplicatePolicies || []}
          isLoading={isLoading}
        />
      </div>

      {/* الصفوف الميتة */}
      <DeadRowsTable
        deadRows={report?.deadRowsInfo || []}
        isLoading={isLoading}
        onVacuumTable={runVacuumTable}
        isVacuuming={isRunningVacuumTable}
      />
    </div>
  );
}
