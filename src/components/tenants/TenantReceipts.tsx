/**
 * مكون عرض سندات القبض للمستأجر
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Receipt, Eye, Download, Printer, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ErrorState } from '@/components/shared/ErrorState';
import { generateReceiptPDF } from '@/lib/generateReceiptPDF';
import { RentalPaymentService } from '@/services/rental-payment.service';
import { toast } from 'sonner';

interface TenantReceiptsProps {
  tenantId: string;
  tenantName: string;
}

interface ReceiptRecord {
  id: string;
  payment_number: string;
  payment_date: string;
  amount_paid: number;
  payment_method: string;
  status: string;
  contract_id: string;
  contracts?: {
    contract_number: string;
    property_id: string;
    properties?: {
      name: string;
    };
  };
}

export function TenantReceipts({ tenantId, tenantName }: TenantReceiptsProps) {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const { data: receipts, isLoading, error, refetch } = useQuery({
    queryKey: ['tenant-receipts', tenantId],
    queryFn: async () => {
      // جلب السندات من rental_payments المرتبطة بعقود المستأجر
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('id')
        .eq('tenant_id', tenantId);

      if (contractsError) throw contractsError;

      if (!contracts || contracts.length === 0) {
        return [];
      }

      const contractIds = contracts.map(c => c.id);

      const { data, error: paymentsError } = await supabase
        .from('rental_payments')
        .select(`
          id,
          payment_number,
          payment_date,
          amount_paid,
          payment_method,
          status,
          contract_id,
          contracts (
            contract_number,
            property_id,
            properties (
              name
            )
          )
        `)
        .in('contract_id', contractIds)
        .eq('status', 'مدفوع')
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;
      return data as ReceiptRecord[];
    },
  });

  const handleViewReceipt = async (receipt: ReceiptRecord) => {
    setIsGenerating(receipt.id);
    try {
      const orgSettings = await RentalPaymentService.getOrganizationSettings();
      
      const receiptData = {
        id: receipt.id,
        payment_number: receipt.payment_number,
        payment_date: receipt.payment_date,
        amount: receipt.amount_paid,
        payer_name: tenantName,
        payment_method: receipt.payment_method,
        description: `دفعة إيجار - عقد ${receipt.contracts?.contract_number || ''} - ${receipt.contracts?.properties?.name || ''}`,
      };

      const doc = await generateReceiptPDF(receiptData, orgSettings);
      
      // فتح في نافذة جديدة
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

  const handleDownloadReceipt = async (receipt: ReceiptRecord) => {
    setIsGenerating(receipt.id);
    try {
      const orgSettings = await RentalPaymentService.getOrganizationSettings();
      
      const receiptData = {
        id: receipt.id,
        payment_number: receipt.payment_number,
        payment_date: receipt.payment_date,
        amount: receipt.amount_paid,
        payer_name: tenantName,
        payment_method: receipt.payment_method,
        description: `دفعة إيجار - عقد ${receipt.contracts?.contract_number || ''} - ${receipt.contracts?.properties?.name || ''}`,
      };

      const doc = await generateReceiptPDF(receiptData, orgSettings);
      doc.save(`سند_قبض_${receipt.payment_number}.pdf`);

      toast.success('تم تحميل السند');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('حدث خطأ أثناء التحميل');
    } finally {
      setIsGenerating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل السندات" message={(error as Error).message} onRetry={refetch} />;
  }

  if (!receipts || receipts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">لا توجد سندات قبض لهذا المستأجر</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          سندات القبض ({receipts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم السند</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>طريقة الدفع</TableHead>
                <TableHead>العقار</TableHead>
                <TableHead className="text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-mono text-sm">
                    {receipt.payment_number}
                  </TableCell>
                  <TableCell>{formatDate(receipt.payment_date)}</TableCell>
                  <TableCell className="font-medium text-success">
                    {formatCurrency(receipt.amount_paid)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{receipt.payment_method}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {receipt.contracts?.properties?.name || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewReceipt(receipt)}
                        disabled={isGenerating === receipt.id}
                        title="عرض"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadReceipt(receipt)}
                        disabled={isGenerating === receipt.id}
                        title="تحميل"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
