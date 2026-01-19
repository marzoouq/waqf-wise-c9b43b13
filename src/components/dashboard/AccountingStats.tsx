import { FileText, CheckCircle2, FileEdit, XCircle } from "lucide-react";
import { useUnifiedKPIs } from "@/hooks/dashboard/useUnifiedKPIs";
import { ErrorState } from "@/components/shared/ErrorState";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";

const AccountingStats = () => {
  const { data: unifiedData, isLoading, isError, refetch } = useUnifiedKPIs();
  
  // تحويل البيانات الموحدة إلى صيغة المحاسب
  const data = unifiedData ? {
    totalEntries: unifiedData.totalJournalEntries,
    postedEntries: unifiedData.postedJournalEntries,
    draftEntries: unifiedData.draftJournalEntries,
    cancelledEntries: unifiedData.cancelledJournalEntries
  } : null;

  if (isLoading) {
    return (
      <UnifiedStatsGrid columns={4}>
        <UnifiedKPICard title="إجمالي القيود" value={0} icon={FileText} variant="primary" loading />
        <UnifiedKPICard title="القيود المرحّلة" value={0} icon={CheckCircle2} variant="success" loading />
        <UnifiedKPICard title="مسودات" value={0} icon={FileEdit} variant="warning" loading />
        <UnifiedKPICard title="ملغية" value={0} icon={XCircle} variant="destructive" loading />
      </UnifiedStatsGrid>
    );
  }

  if (isError) {
    return <ErrorState title="خطأ في تحميل الإحصائيات" onRetry={refetch} />;
  }

  if (!data) return null;

  return (
    <UnifiedStatsGrid columns={4}>
      <UnifiedKPICard
        title="إجمالي القيود"
        value={data.totalEntries}
        icon={FileText}
        variant="primary"
      />
      <UnifiedKPICard
        title="القيود المرحّلة"
        value={data.postedEntries}
        icon={CheckCircle2}
        variant="success"
      />
      <UnifiedKPICard
        title="مسودات"
        value={data.draftEntries}
        icon={FileEdit}
        variant="warning"
      />
      <UnifiedKPICard
        title="ملغية"
        value={data.cancelledEntries}
        icon={XCircle}
        variant="destructive"
      />
    </UnifiedStatsGrid>
  );
};

export default AccountingStats;
