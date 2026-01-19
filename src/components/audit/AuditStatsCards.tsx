import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Users
} from "lucide-react";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { useAuditLogsStats } from "@/hooks/system/useAuditLogsEnhanced";

interface AuditStatsCardsProps {
  dateRange?: { start: string; end: string };
}

export function AuditStatsCards({ dateRange }: AuditStatsCardsProps) {
  const { data: stats, isLoading } = useAuditLogsStats(dateRange);

  return (
    <UnifiedStatsGrid columns={{ sm: 2, md: 3, lg: 6 }}>
      <UnifiedKPICard
        title="إجمالي السجلات"
        value={stats?.totalLogs?.toLocaleString('ar-SA') || 0}
        icon={FileText}
        variant="primary"
        loading={isLoading}
      />

      <UnifiedKPICard
        title="عمليات الإضافة"
        value={stats?.insertCount?.toLocaleString('ar-SA') || 0}
        icon={Plus}
        variant="success"
        loading={isLoading}
      />

      <UnifiedKPICard
        title="عمليات التعديل"
        value={stats?.updateCount?.toLocaleString('ar-SA') || 0}
        icon={Edit}
        variant="info"
        loading={isLoading}
      />

      <UnifiedKPICard
        title="عمليات الحذف"
        value={stats?.deleteCount?.toLocaleString('ar-SA') || 0}
        icon={Trash2}
        variant="destructive"
        loading={isLoading}
      />

      <UnifiedKPICard
        title="تنبيهات حرجة"
        value={stats?.criticalCount?.toLocaleString('ar-SA') || 0}
        icon={AlertTriangle}
        variant="warning"
        loading={isLoading}
      />

      <UnifiedKPICard
        title="المستخدمون النشطون"
        value={stats?.uniqueUsers?.toLocaleString('ar-SA') || 0}
        icon={Users}
        variant="default"
        loading={isLoading}
      />
    </UnifiedStatsGrid>
  );
}
