import { Card, CardContent } from '@/components/ui/card';
import { ArrowDownCircle, ArrowUpCircle, Receipt, AlertTriangle, TrendingUp } from 'lucide-react';

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
  
  const cards = [
    {
      title: 'إجمالي التحصيل',
      value: stats.totalCollections,
      icon: ArrowDownCircle,
      color: 'text-status-success',
      bgColor: 'bg-status-success/10',
    },
    {
      title: 'إجمالي الصرف',
      value: stats.totalPayments,
      icon: ArrowUpCircle,
      color: 'text-status-error',
      bgColor: 'bg-status-error/10',
    },
    {
      title: 'صافي الحركة',
      value: netAmount,
      icon: TrendingUp,
      color: netAmount >= 0 ? 'text-status-success' : 'text-status-error',
      bgColor: netAmount >= 0 ? 'bg-status-success/10' : 'bg-status-error/10',
    },
    {
      title: 'عدد العمليات',
      value: stats.transactionsCount,
      icon: Receipt,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      isCount: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className={`text-xl font-bold ${card.color}`}>
                  {card.isCount
                    ? card.value
                    : `${card.value.toLocaleString('ar-SA')} ر.س`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* إحصائيات الإيجارات المعلقة */}
      {pendingStats && pendingStats.overdueCount > 0 && (
        <Card className="md:col-span-2 lg:col-span-4 border-status-warning/50 bg-status-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-status-warning/20">
                <AlertTriangle className="h-5 w-5 text-status-warning" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-status-warning">
                  يوجد {pendingStats.overdueCount} دفعات إيجار متأخرة
                </p>
                <p className="text-lg font-bold text-status-warning">
                  إجمالي المتأخرات: {pendingStats.overdueAmount.toLocaleString('ar-SA')} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
