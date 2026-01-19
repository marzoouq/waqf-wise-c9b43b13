import { DollarSign, Clock, AlertTriangle, FileText } from 'lucide-react';
import { UnifiedKPICard } from '@/components/unified/UnifiedKPICard';
import { UnifiedStatsGrid } from '@/components/unified/UnifiedStatsGrid';

interface InvoicesStats {
  totalSales: number;
  paidCount: number;
  pendingCount: number;
  overdueAmount: number;
  overdueCount: number;
  totalCount: number;
}

interface InvoicesStatsCardsProps {
  stats: InvoicesStats;
}

export function InvoicesStatsCards({ stats }: InvoicesStatsCardsProps) {
  return (
    <UnifiedStatsGrid columns={4}>
      <UnifiedKPICard
        title="إجمالي المبيعات"
        value={`${stats.totalSales.toFixed(2)} ر.س`}
        icon={DollarSign}
        variant="success"
        subtitle={`${stats.paidCount} فاتورة مدفوعة`}
      />

      <UnifiedKPICard
        title="الفواتير المعلقة"
        value={stats.pendingCount}
        icon={Clock}
        variant="warning"
        subtitle="بانتظار الدفع"
      />

      <UnifiedKPICard
        title="المتأخرات"
        value={`${stats.overdueAmount.toFixed(2)} ر.س`}
        icon={AlertTriangle}
        variant="destructive"
        subtitle={`${stats.overdueCount} فاتورة متأخرة`}
      />

      <UnifiedKPICard
        title="إجمالي الفواتير"
        value={stats.totalCount}
        icon={FileText}
        variant="default"
        subtitle="فاتورة مسجلة"
      />
    </UnifiedStatsGrid>
  );
}
