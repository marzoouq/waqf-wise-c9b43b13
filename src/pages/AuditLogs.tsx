import { Shield } from "lucide-react";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { AuditLogsTable } from "@/components/audit";
import { useRealtimeAuditAlerts } from "@/hooks/system/useAuditAlerts";

const AuditLogs = () => {
  // الاشتراك في التنبيهات الفورية
  useRealtimeAuditAlerts();

  return (
    <PageErrorBoundary pageName="سجل التدقيق">
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8 space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              سجل التدقيق والمراقبة
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              مراقبة شاملة لجميع العمليات مع تنبيهات ذكية وعرض التغييرات
            </p>
          </div>
        </div>

        {/* Dashboard + Table */}
        <AuditLogsTable />
      </div>
    </PageErrorBoundary>
  );
};

export default AuditLogs;
