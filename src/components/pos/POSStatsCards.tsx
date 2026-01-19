/**
 * بطاقات إحصائيات نقطة البيع (POS)
 * تستخدم UnifiedStatsGrid + UnifiedKPICard
 */

import { ArrowDownCircle, ArrowUpCircle, Receipt, AlertTriangle, TrendingUp } from 'lucide-react';
import { UnifiedStatsGrid } from '@/components/unified/UnifiedStatsGrid';
import { UnifiedKPICard } from '@/components/unified/UnifiedKPICard';

interface POSStatsCardsProps {
  stats: {
    totalCollections: number;
    totalPayments: number;
    transactionsCount: number;
    cashTransactions: number;
    cardTransactions: number;
  };
  pendingStats?: {
    totalPending: number;
    overdueCount: number;
    overdueAmount: number;
    pendingCount: number;
  };
}

export function POSStatsCards({ stats, pendingStats }: POSStatsCardsProps) {
  const netAmount = stats.totalCollections - stats.totalPayments;

  return (
    <div className="space-y-4">
      <UnifiedStatsGrid columns={4}>
        <UnifiedKPICard
          title="إجمالي التحصيل"
          value={`${stats.totalCollections.toLocaleString('ar-SA')} ر.س`}
          icon={ArrowDownCircle}
          variant="success"
        />
        <UnifiedKPICard
          title="إجمالي الصرف"
          value={`${stats.totalPayments.toLocaleString('ar-SA')} ر.س`}
          icon={ArrowUpCircle}
          variant="destructive"
        />
        <UnifiedKPICard
          title="صافي الحركة"
          value={`${netAmount.toLocaleString('ar-SA')} ر.س`}
          icon={TrendingUp}
          variant={netAmount >= 0 ? "success" : "destructive"}
        />
        <UnifiedKPICard
          title="عدد العمليات"
          value={stats.transactionsCount}
          icon={Receipt}
          variant="default"
        />
      </UnifiedStatsGrid>

      {/* إحصائيات الإيجارات المعلقة */}
      {pendingStats && pendingStats.overdueCount > 0 && (
        <UnifiedKPICard
          title={`يوجد ${pendingStats.overdueCount} دفعات إيجار متأخرة`}
          value={`${pendingStats.overdueAmount.toLocaleString('ar-SA')} ر.س`}
          subtitle="إجمالي المتأخرات"
          icon={AlertTriangle}
          variant="warning"
        />
      )}
    </div>
  );
}
