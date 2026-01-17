/**
 * بطاقة الإيجارات المستحقة اليوم
 * Today Due Payments Card
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Receipt, ArrowLeft } from 'lucide-react';
import { useCollectionStats } from '@/hooks/dashboard/useCollectionStats';
import { formatCurrency } from '@/lib/formatters';
import { useNavigate } from 'react-router-dom';

export function TodayDuePaymentsCard() {
  const { data: stats, isLoading } = useCollectionStats();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            مستحقات اليوم
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

  const todayPayments = stats.todayDuePayments;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            مستحقات اليوم
          </span>
          {todayPayments.length > 0 && (
            <Badge variant="secondary">
              {todayPayments.length} دفعة
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todayPayments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">لا توجد مستحقات اليوم</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayPayments.slice(0, 5).map(payment => (
              <div 
                key={payment.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{payment.tenantName}</p>
                    {payment.unitName && (
                      <p className="text-xs text-muted-foreground">{payment.unitName}</p>
                    )}
                  </div>
                </div>
                <span className="font-bold text-primary">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            ))}

            {/* إجمالي */}
            <div className="pt-3 border-t flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">الإجمالي المستحق</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(stats.todayDueAmount)}
              </span>
            </div>

            {/* زر عرض الكل */}
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => navigate('/payments')}
            >
              <Receipt className="h-4 w-4" />
              عرض جميع المدفوعات
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
