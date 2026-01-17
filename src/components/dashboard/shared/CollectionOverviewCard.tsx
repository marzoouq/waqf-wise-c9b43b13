/**
 * بطاقة نظرة عامة على التحصيل
 * Collection Overview Card
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Wallet } from 'lucide-react';
import { useCollectionStats } from '@/hooks/dashboard/useCollectionStats';
import { formatCurrency } from '@/lib/formatters';

export function CollectionOverviewCard() {
  const { data: stats, isLoading } = useCollectionStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            نظرة عامة على التحصيل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const getCollectionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-success';
    if (rate >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'bg-success';
    if (rate >= 50) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            نظرة عامة على التحصيل
          </span>
          <Badge variant={stats.collectionRate >= 80 ? 'default' : stats.collectionRate >= 50 ? 'secondary' : 'destructive'}>
            {stats.collectionRate}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* شريط التقدم */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">نسبة التحصيل</span>
            <span className={`font-bold ${getCollectionRateColor(stats.collectionRate)}`}>
              {stats.collectionRate}%
            </span>
          </div>
          <Progress 
            value={stats.collectionRate} 
            className="h-2"
          />
        </div>

        {/* المبالغ */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-center gap-2 text-success mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">المحصّل فعلياً</span>
            </div>
            <span className="text-lg font-bold text-success">
              {formatCurrency(stats.totalCollected)}
            </span>
          </div>
          
          <div className="p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">المستحق للفترة</span>
            </div>
            <span className="text-lg font-bold">
              {formatCurrency(stats.totalExpected)}
            </span>
          </div>
        </div>

        {/* إحصائيات الدفعات */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center p-2">
            <div className="flex items-center justify-center gap-1 text-success mb-1">
              <CheckCircle className="h-3 w-3" />
            </div>
            <span className="text-lg font-bold">{stats.paidPayments}</span>
            <p className="text-xs text-muted-foreground">مدفوعة</p>
          </div>
          
          <div className="text-center p-2">
            <div className="flex items-center justify-center gap-1 text-warning mb-1">
              <Clock className="h-3 w-3" />
            </div>
            <span className="text-lg font-bold">{stats.pendingPayments}</span>
            <p className="text-xs text-muted-foreground">معلقة</p>
          </div>
          
          <div className="text-center p-2">
            <div className="flex items-center justify-center gap-1 text-destructive mb-1">
              <AlertTriangle className="h-3 w-3" />
            </div>
            <span className="text-lg font-bold">{stats.overduePayments}</span>
            <p className="text-xs text-muted-foreground">متأخرة</p>
          </div>
        </div>

        {/* تنبيه المتأخرات */}
        {stats.totalOverdueAmount > 0 && (
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">متأخرات تحصيل</span>
              </div>
              <span className="text-lg font-bold text-destructive">
                {formatCurrency(stats.totalOverdueAmount)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
