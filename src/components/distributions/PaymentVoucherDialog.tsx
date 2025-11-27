import { useState } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Receipt, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PaymentVoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  distributionId?: string;
  beneficiaryId?: string;
  onSuccess?: () => void;
}

export function PaymentVoucherDialog({
  open,
  onOpenChange,
  distributionId,
  beneficiaryId,
  onSuccess,
}: PaymentVoucherDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    voucherType: "payment" as "receipt" | "payment" | "journal",
    amount: "",
    description: "",
    paymentMethod: "bank_transfer" as "bank_transfer" | "cash" | "check" | "digital_wallet",
    referenceNumber: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال مبلغ صحيح",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // توليد رقم السند التلقائي
      const { data: voucherNumber, error: voucherError } = await supabase
        .rpc('generate_voucher_number', { voucher_type: formData.voucherType });

      if (voucherError) throw voucherError;

      // إنشاء السند
      const { error: insertError } = await supabase
        .from('payment_vouchers')
        .insert({
          voucher_number: voucherNumber,
          voucher_type: formData.voucherType,
          distribution_id: distributionId || null,
          beneficiary_id: beneficiaryId || null,
          amount: parseFloat(formData.amount),
          description: formData.description,
          payment_method: formData.paymentMethod,
          reference_number: formData.referenceNumber || null,
          notes: formData.notes || null,
          status: 'draft',
        });

      if (insertError) throw insertError;

      toast({
        title: "تم بنجاح",
        description: `تم إنشاء السند رقم ${voucherNumber}`,
      });

      onOpenChange(false);
      onSuccess?.();
      
      // إعادة تعيين النموذج
      setFormData({
        voucherType: "payment",
        amount: "",
        description: "",
        paymentMethod: "bank_transfer",
        referenceNumber: "",
        notes: "",
      });
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast({
        title: "خطأ",
        description: "فشل إنشاء السند. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="إنشاء سند جديد"
      description="إنشاء سند دفع أو قبض أو قيد يومية"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="voucherType">نوع السند *</Label>
                <Select
                  value={formData.voucherType}
                  onValueChange={(value) => setFormData({ ...formData, voucherType: value as "receipt" | "payment" | "journal" })}
                >
                  <SelectTrigger id="voucherType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment">سند صرف</SelectItem>
                    <SelectItem value="receipt">سند قبض</SelectItem>
                    <SelectItem value="journal">قيد يومية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">المبلغ *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف السند..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as "bank_transfer" | "cash" | "check" | "digital_wallet" })}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                    <SelectItem value="cash">نقداً</SelectItem>
                    <SelectItem value="check">شيك</SelectItem>
                    <SelectItem value="digital_wallet">محفظة رقمية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceNumber">الرقم المرجعي</Label>
                <Input
                  id="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  placeholder="رقم الشيك أو التحويل..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="ملاحظات إضافية..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            إلغاء
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            حفظ السند
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}