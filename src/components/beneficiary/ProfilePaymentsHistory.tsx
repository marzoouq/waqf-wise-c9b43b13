import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/LoadingState';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ProfilePaymentsHistoryProps {
  beneficiaryId: string;
}

export function ProfilePaymentsHistory({ beneficiaryId }: ProfilePaymentsHistoryProps) {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['beneficiary-payments', beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('beneficiary_id', beneficiaryId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return <LoadingState message="جاري تحميل سجل المدفوعات..." />;
  }

  const totalPayments = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const currentYear = new Date().getFullYear();
  const currentYearPayments = payments?.filter(p => 
    new Date(p.payment_date).getFullYear() === currentYear
  ).reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* ملخص المدفوعات */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المدفوعات</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalPayments.toLocaleString('ar-SA')} ريال
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مدفوعات {currentYear}</p>
                <p className="text-2xl font-bold text-foreground">
                  {currentYearPayments.toLocaleString('ar-SA')} ريال
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">عدد المدفوعات</p>
                <p className="text-2xl font-bold text-foreground">
                  {payments?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة المدفوعات */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المدفوعات التفصيلي</CardTitle>
        </CardHeader>
        <CardContent>
          {!payments || payments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد مدفوعات مسجلة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      {payment.description || 'دفعة من الوقف'}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>
                        {format(new Date(payment.payment_date), 'PPP', { locale: ar })}
                      </span>
                      {payment.payment_method && (
                        <>
                          <span>•</span>
                          <span>{payment.payment_method}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <div className="text-xl font-bold text-primary">
                      {payment.amount.toLocaleString('ar-SA')} ريال
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
