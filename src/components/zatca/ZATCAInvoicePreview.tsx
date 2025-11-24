import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, Download, QrCode, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ZATCAInvoicePreviewProps {
  invoice: {
    id: string;
    invoice_number: string;
    invoice_date: string;
    customer_name: string;
    customer_email: string | null;
    customer_phone: string | null;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    status: string;
    notes: string | null;
  };
}

export function ZATCAInvoicePreview({ invoice }: ZATCAInvoicePreviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zatcaStatus, setZatcaStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const handleSubmitToZATCA = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('zatca-submit', {
        body: { invoiceId: invoice.id },
      });

      if (error) throw error;

      if (data.success) {
        setZatcaStatus('success');
        toast.success("تم إرسال الفاتورة إلى هيئة الزكاة والضريبة", {
          description: `رقم الإرسال: ${data.submissionId}`,
        });
      } else {
        setZatcaStatus('error');
        toast.error("فشل إرسال الفاتورة", {
          description: data.error || "حدث خطأ غير متوقع",
        });
      }
    } catch (error) {
      setZatcaStatus('error');
      toast.error("خطأ في الاتصال", {
        description: "تعذر الاتصال بخدمة هيئة الزكاة والضريبة",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">فاتورة ضريبية</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              رقم الفاتورة: {invoice.invoice_number}
            </p>
          </div>
          <Badge 
            variant={
              zatcaStatus === 'success' ? 'default' : 
              zatcaStatus === 'error' ? 'destructive' : 
              'secondary'
            }
            className="gap-2"
          >
            {zatcaStatus === 'success' && <CheckCircle className="h-4 w-4" />}
            {zatcaStatus === 'error' && <AlertCircle className="h-4 w-4" />}
            {zatcaStatus === 'success' ? 'مرسلة للهيئة' : 
             zatcaStatus === 'error' ? 'فشل الإرسال' : 
             'معلقة'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">التاريخ</p>
            <p className="font-semibold">
              {format(new Date(invoice.invoice_date), "dd MMMM yyyy", { locale: ar })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">اسم العميل</p>
            <p className="font-semibold">{invoice.customer_name}</p>
          </div>
          {invoice.customer_email && (
            <div>
              <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
              <p className="font-semibold">{invoice.customer_email}</p>
            </div>
          )}
          {invoice.customer_phone && (
            <div>
              <p className="text-sm text-muted-foreground">رقم الجوال</p>
              <p className="font-semibold">{invoice.customer_phone}</p>
            </div>
          )}
        </div>

        {/* Financial Summary */}
        <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">المجموع قبل الضريبة</span>
            <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ضريبة القيمة المضافة (15%)</span>
            <span className="font-mono">{formatCurrency(invoice.tax_amount)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t-2">
            <span className="font-bold text-lg">الإجمالي</span>
            <span className="font-bold text-lg text-primary">
              {formatCurrency(invoice.total_amount)}
            </span>
          </div>
        </div>

        {/* QR Code Placeholder */}
        <div className="flex justify-center">
          <div className="border-2 border-dashed rounded-lg p-8 bg-muted/20">
            <QrCode className="h-32 w-32 text-muted-foreground" />
            <p className="text-center text-sm text-muted-foreground mt-2">
              رمز الاستجابة السريع
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button 
            className="flex-1 gap-2" 
            onClick={handleSubmitToZATCA}
            disabled={isSubmitting || zatcaStatus === 'success'}
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال للهيئة'}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            تحميل PDF
          </Button>
        </div>

        {invoice.notes && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-1">ملاحظات</p>
            <p className="text-sm">{invoice.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
