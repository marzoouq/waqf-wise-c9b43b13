/**
 * مكون عرض سندات القبض للعقد
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Receipt, Eye, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ErrorState } from '@/components/shared/ErrorState';
import { generateReceiptPDF } from '@/lib/generateReceiptPDF';
import { RentalPaymentService } from '@/services/rental-payment.service';
import { toast } from 'sonner';

interface ContractReceiptsProps {
  contractId: string;
  tenantName: string;
}

interface PaymentRecord {
  id: string;
  payment_number: string;
  payment_date: string;
  amount_paid: number;
  payment_method: string;
  status: string;
  notes?: string;
}

export function ContractReceipts({ contractId, tenantName }: ContractReceiptsProps) {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const { data: payments, isLoading, error, refetch } = useQuery({
    queryKey: ['contract-receipts', contractId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rental_payments')
        .select('*')
        .eq('contract_id', contractId)
        .eq('status', 'مدفوع')
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data as PaymentRecord[];
    },
  });

  const handleViewReceipt = async (payment: PaymentRecord) => {
    setIsGenerating(payment.id);
    try {
      const orgSettings = await RentalPaymentService.getOrganizationSettings();
      
      const receiptData = {
        id: payment.id,
        payment_number: payment.payment_number,
        payment_date: payment.payment_date,
        amount: payment.amount_paid,
        payer_name: tenantName,
        payment_method: payment.payment_method,
        description: `دفعة إيجار`,
        notes: payment.notes,
      };

      const doc = await generateReceiptPDF(receiptData, orgSettings);
      
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');

      toast.success('تم فتح سند القبض');
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('حدث خطأ أثناء توليد السند');
    } finally {
      setIsGenerating(null);
    }
  };

  const totalPaid = payments?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0;

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (error) {
    return <ErrorState title="خطأ" message={(error as Error).message} onRetry={refetch} />;
  }

  if (!payments || payments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Receipt className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">لا توجد دفعات مسجلة</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            سندات القبض ({payments.length})
          </CardTitle>
          <Badge variant="secondary" className="text-success">
            المجموع: {formatCurrency(totalPaid)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{payment.payment_number}</span>
                  <Badge variant="outline" className="text-xs">
                    {payment.payment_method}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(payment.payment_date)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-success">
                  {formatCurrency(payment.amount_paid)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleViewReceipt(payment)}
                  disabled={isGenerating === payment.id}
                  title="عرض السند"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
