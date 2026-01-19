import { useBeneficiaryProfileStats } from '@/hooks/beneficiary/useBeneficiaryProfileStats';
import { DollarSign, FileText, Users, TrendingUp, Calendar } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { UnifiedStatsGrid } from '@/components/unified/UnifiedStatsGrid';
import { UnifiedKPICard } from '@/components/unified/UnifiedKPICard';

interface ProfileStatsProps {
  beneficiaryId: string;
}

export function ProfileStats({ beneficiaryId }: ProfileStatsProps) {
  const { data: stats, isLoading, error, refetch } = useBeneficiaryProfileStats(beneficiaryId);

  if (isLoading) {
    return <LoadingState message="جاري تحميل الإحصائيات..." />;
  }

  if (error) {
    return <ErrorState title="خطأ في التحميل" message="فشل تحميل الإحصائيات" onRetry={refetch} />;
  }

  return (
    <UnifiedStatsGrid columns={3}>
      <UnifiedKPICard
        title="إجمالي المدفوعات"
        value={`${stats?.totalPayments?.toLocaleString('ar-SA') || 0} ريال`}
        subtitle={`من ${stats?.paymentsCount || 0} دفعة`}
        icon={DollarSign}
        variant="success"
      />
      <UnifiedKPICard
        title="الطلبات المقدمة"
        value={stats?.approvedRequests || 0}
        subtitle={`من ${stats?.totalRequests || 0} طلب`}
        icon={FileText}
        variant="info"
      />
      <UnifiedKPICard
        title="الطلبات المعلقة"
        value={stats?.pendingRequests || 0}
        subtitle="قيد المراجعة"
        icon={Calendar}
        variant="warning"
      />
      <UnifiedKPICard
        title="المستندات"
        value={stats?.attachmentsCount || 0}
        subtitle="مرفق"
        icon={FileText}
        variant="default"
      />
      <UnifiedKPICard
        title="أفراد العائلة"
        value={stats?.familyMembersCount || 0}
        subtitle="فرد مسجل"
        icon={Users}
        variant="primary"
      />
      <UnifiedKPICard
        title="متوسط الدفعة"
        value={stats?.paymentsCount 
          ? `${Math.round((stats.totalPayments || 0) / stats.paymentsCount).toLocaleString('ar-SA')} ريال`
          : '0 ريال'}
        subtitle="لكل دفعة"
        icon={TrendingUp}
        variant="warning"
      />
    </UnifiedStatsGrid>
  );
}
