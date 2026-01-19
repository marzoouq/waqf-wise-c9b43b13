import { Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import { useApprovalsOverview } from "@/hooks/approvals";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";

export function ApprovalsOverview() {
  const { data: stats } = useApprovalsOverview();

  return (
    <UnifiedStatsGrid columns={4}>
      <UnifiedKPICard
        title="إجمالي الموافقات"
        value={stats?.total || 0}
        icon={FileText}
        variant="primary"
      />
      <UnifiedKPICard
        title="قيد المراجعة"
        value={stats?.pending || 0}
        icon={Clock}
        variant="warning"
      />
      <UnifiedKPICard
        title="موافق عليها"
        value={stats?.approved || 0}
        icon={CheckCircle}
        variant="success"
      />
      <UnifiedKPICard
        title="مرفوضة"
        value={stats?.rejected || 0}
        icon={XCircle}
        variant="destructive"
      />
    </UnifiedStatsGrid>
  );
}
