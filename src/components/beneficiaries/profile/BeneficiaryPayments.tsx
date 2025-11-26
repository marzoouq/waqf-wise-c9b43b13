import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { DollarSign, Calendar, CheckCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  reference: string | null;
  description: string | null;
}

interface BeneficiaryPaymentsProps {
  beneficiaryId: string;
}

/**
 * سجل مدفوعات المستفيد - المرحلة 2
 */
export function BeneficiaryPayments({ beneficiaryId }: BeneficiaryPaymentsProps) {
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['beneficiary-payments', beneficiaryId],
    queryFn: async () => {
      // جلب المدفوعات من distribution_details
      const { data, error } = await supabase
        .from('distribution_details')
        .select(`
          id,
          allocated_amount,
          payment_status,
          created_at,
          distribution_id
        `)
        .eq('beneficiary_id', beneficiaryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        amount: item.allocated_amount,
        payment_date: item.created_at || new Date().toISOString(),
        payment_method: 'تحويل بنكي',
        status: item.payment_status || 'completed',
        reference: item.distribution_id || null,
        description: `مدفوعات التوزيع`,
      })) as Payment[];
    },
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (payments.length === 0) {
    return (
      <EmptyState
        icon={DollarSign}
        title="لا توجد مدفوعات"
        description="لم يتم صرف أي مدفوعات لهذا المستفيد بعد"
      />
    );
  }

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* ملخص المدفوعات */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المدفوعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount.toLocaleString()} ريال</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              عدد المدفوعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              متوسط الدفعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(totalAmount / payments.length).toLocaleString()} ريال
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول المدفوعات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            سجل المدفوعات
          </CardTitle>
          <CardDescription>
            جميع المدفوعات المصروفة للمستفيد ({payments.length} دفعة)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>طريقة الدفع</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(payment.payment_date).toLocaleDateString('ar-SA')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-primary">
                        {payment.amount.toLocaleString()} ريال
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {payment.description || payment.reference || '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {payment.payment_method}
                    </TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                        <CheckCircle className="h-3 w-3 ml-1" />
                        {payment.status === 'completed' ? 'مكتمل' : payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
