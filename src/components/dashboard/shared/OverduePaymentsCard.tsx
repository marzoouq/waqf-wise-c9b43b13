/**
 * بطاقة المتأخرات
 * Overdue Payments Card
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, User, Clock, ArrowLeft } from 'lucide-react';
import { useCollectionStats } from '@/hooks/dashboard/useCollectionStats';
import { formatCurrency } from '@/lib/formatters';
import { useNavigate } from 'react-router-dom';

export function OverduePaymentsCard() {
  const { data: stats, isLoading } = useCollectionStats();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            المتأخرات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const overduePayments = stats.overduePaymentsList;

  return (
    <Card className={overduePayments.length > 0 ? 'border-destructive/30' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            المتأخرات
          </span>
          {overduePayments.length > 0 && (
            <Badge variant="destructive">
              {stats.overduePayments} دفعة
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {overduePayments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <div className="w-12 h-12 rounded-full bg-success/10 mx-auto mb-2 flex items-center justify-center">
              <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm">لا توجد متأخرات 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {overduePayments.slice(0, 5).map(payment => (
              <div 
                key={payment.id}
                className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{payment.tenantName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>متأخر {payment.daysOverdue} يوم</span>
                    </div>
                  </div>
                </div>
                <div className="text-end">
                  <span className="font-bold text-destructive block">
                    {formatCurrency(payment.amount)}
                  </span>
                  <span className="text-xs text-muted-foreground">{payment.propertyName}</span>
                </div>
              </div>
            ))}

            {/* إجمالي المتأخرات */}
            <div className="pt-3 border-t flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">إجمالي المتأخرات</span>
              <span className="text-lg font-bold text-destructive">
                {formatCurrency(stats.totalOverdueAmount)}
              </span>
            </div>

            {/* زر متابعة */}
            <Button 
              variant="destructive" 
              className="w-full gap-2"
              onClick={() => navigate('/payments')}
            >
              <AlertTriangle className="h-4 w-4" />
              متابعة المتأخرات
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
