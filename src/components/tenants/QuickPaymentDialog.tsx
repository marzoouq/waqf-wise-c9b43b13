import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { Banknote, Loader2, Receipt, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { generateReceiptPDF } from '@/lib/generateReceiptPDF';
import { RentalPaymentService } from '@/services/rental-payment.service';

interface QuickPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: {
    id: string;
    full_name: string;
    current_balance: number;
  } | null;
}

const paymentMethods = [
  { value: 'نقدي', label: 'نقدي' },
  { value: 'تحويل بنكي', label: 'تحويل بنكي' },
  { value: 'شيك', label: 'شيك' },
  { value: 'بطاقة', label: 'بطاقة ائتمان/مدى' },
];

export function QuickPaymentDialog({
  open,
  onOpenChange,
  tenant,
}: QuickPaymentDialogProps) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('نقدي');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptGenerated, setReceiptGenerated] = useState(false);
  const [lastReceiptNumber, setLastReceiptNumber] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!tenant || !amount || parseFloat(amount) <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. توليد رقم سند فريد
      const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}`;
      const paymentDate = new Date().toISOString().split('T')[0];
      
      // 2. إنشاء سجل دفعة في tenant_ledger
      const { data: ledgerEntry, error: ledgerError } = await supabase
        .from('tenant_ledger')
        .insert({
          tenant_id: tenant.id,
          transaction_type: 'payment',
          transaction_date: paymentDate,
          credit_amount: parseFloat(amount),
          debit_amount: 0,
          description: `دفعة إيجار - ${paymentMethod}${notes ? ` - ${notes}` : ''}`,
          reference_type: 'quick_payment',
          reference_number: receiptNumber,
        })
        .select()
        .single();

      if (ledgerError) throw ledgerError;

      // 3. توليد سند القبض PDF
      try {
        const orgSettings = await RentalPaymentService.getOrganizationSettings();
        
        const receiptData = {
          id: ledgerEntry.id,
          payment_number: receiptNumber,
          payment_date: paymentDate,
          amount: parseFloat(amount),
          payer_name: tenant.full_name,
          payment_method: paymentMethod,
          description: `دفعة إيجار سريعة${notes ? ` - ${notes}` : ''}`,
          notes: notes || undefined,
        };

        const doc = await generateReceiptPDF(receiptData, orgSettings);
        
        // فتح السند في نافذة جديدة
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
        
        setReceiptGenerated(true);
        setLastReceiptNumber(receiptNumber);
      } catch (pdfError) {
        console.error('Error generating receipt PDF:', pdfError);
        // لا نوقف العملية إذا فشل توليد PDF
      }

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <div>
            <p className="font-medium">تم تسجيل الدفعة بنجاح</p>
            <p className="text-xs text-muted-foreground">رقم السند: {receiptNumber}</p>
          </div>
        </div>
      );
      
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-receipts'] });
      
      // إغلاق بعد ثانيتين لإظهار رسالة النجاح
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 1500);
      
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('حدث خطأ أثناء تسجيل الدفعة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setPaymentMethod('نقدي');
    setNotes('');
    setReceiptGenerated(false);
    setLastReceiptNumber(null);
  };

  const handlePayFullBalance = () => {
    if (tenant && tenant.current_balance > 0) {
      setAmount(tenant.current_balance.toString());
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            تسجيل دفعة سريعة
          </DialogTitle>
        </DialogHeader>

        {tenant && (
          <div className="space-y-4">
            {/* معلومات المستأجر */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="font-medium">{tenant.full_name}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-muted-foreground">الرصيد المستحق:</span>
                <span className={`font-bold ${tenant.current_balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  {formatCurrency(tenant.current_balance)}
                </span>
              </div>
            </div>

            {/* إشعار السند التلقائي */}
            <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg text-sm">
              <Receipt className="h-4 w-4 text-primary" />
              <span>سيتم إصدار سند قبض تلقائياً عند تسجيل الدفعة</span>
            </div>

            {/* المبلغ */}
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1"
                />
                {tenant.current_balance > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePayFullBalance}
                  >
                    الكل
                  </Button>
                )}
              </div>
            </div>

            {/* طريقة الدفع */}
            <div className="space-y-2">
              <Label>طريقة الدفع</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ملاحظات */}
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات (اختياري)</Label>
              <Textarea
                id="notes"
                placeholder="أي ملاحظات إضافية..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ms-2" />
                جاري التسجيل...
              </>
            ) : (
              <>
                <Receipt className="h-4 w-4 ms-2" />
                تسجيل وإصدار سند
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
