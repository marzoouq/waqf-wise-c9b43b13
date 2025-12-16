import { useState } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLoanInstallments } from "@/hooks/payments/useLoanInstallments";
import { useLoanPayments } from "@/hooks/payments/useLoanPayments";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface LoanPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanId: string;
  loanNumber: string;
}

export function LoanPaymentDialog({
  open,
  onOpenChange,
  loanId,
  loanNumber,
}: LoanPaymentDialogProps) {
  const { installments } = useLoanInstallments(loanId);
  const { addPayment } = useLoanPayments(loanId);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    installment_id: "",
    payment_amount: 0,
    payment_method: "cash" as "cash" | "bank_transfer" | "cheque" | "card",
    payment_date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });

  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());

  // Filter unpaid/partially paid installments
  const unpaidInstallments = installments.filter(
    (inst) => inst.status === "pending" || inst.status === "partial" || inst.status === "overdue"
  );

  const selectedInstallment = installments.find(
    (inst) => inst.id === formData.installment_id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await addPayment({
        loan_id: loanId,
        installment_id: formData.installment_id || undefined,
        payment_amount: Number(formData.payment_amount),
        payment_method: formData.payment_method,
        payment_date: format(paymentDate || new Date(), "yyyy-MM-dd"),
        notes: formData.notes || undefined,
      });

      onOpenChange(false);

      // Reset form
      setFormData({
        installment_id: "",
        payment_amount: 0,
        payment_method: "cash",
        payment_date: format(new Date(), "yyyy-MM-dd"),
        notes: "",
      });
      setPaymentDate(new Date());
    } catch (error) {
      logger.error(error, { context: 'submit_loan_payment', severity: 'medium' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={`تسجيل دفعة للقرض ${loanNumber}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="installment">القسط (اختياري)</Label>
            <Select
              value={formData.installment_id}
              onValueChange={(value) => {
                const installment = installments.find((i) => i.id === value);
                setFormData({
                  ...formData,
                  installment_id: value,
                  payment_amount: installment?.remaining_amount || 0,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر القسط (أو اترك فارغاً للدفعة العامة)" />
              </SelectTrigger>
              <SelectContent>
                {unpaidInstallments.map((installment) => (
                  <SelectItem key={installment.id} value={installment.id}>
                    القسط #{installment.installment_number} - المتبقي:{" "}
                    {installment.remaining_amount.toLocaleString('ar-SA')} ريال
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedInstallment && (
              <p className="text-sm text-muted-foreground">
                تاريخ الاستحقاق:{" "}
                {format(new Date(selectedInstallment.due_date), "dd/MM/yyyy", {
                  locale: ar,
                })}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_amount">المبلغ (ريال) *</Label>
            <Input
              id="payment_amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.payment_amount}
              onChange={(e) =>
                setFormData({ ...formData, payment_amount: Number(e.target.value) })
              }
              required
            />
            {selectedInstallment && (
              <p className="text-sm text-muted-foreground">
                المبلغ المتبقي: {selectedInstallment.remaining_amount.toLocaleString('ar-SA')} ريال
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">طريقة الدفع *</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    payment_method: value as "bank_transfer" | "card" | "cash" | "cheque",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                  <SelectItem value="cheque">شيك</SelectItem>
                  <SelectItem value="card">بطاقة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>تاريخ الدفع *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !paymentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ms-2 h-4 w-4" />
                    {paymentDate ? (
                      format(paymentDate, "PPP", { locale: ar })
                    ) : (
                      <span>اختر التاريخ</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={paymentDate}
                    onSelect={setPaymentDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
            {isLoading ? "جاري الحفظ..." : "تسجيل الدفعة"}
            </Button>
          </div>
        </form>
    </ResponsiveDialog>
  );
}
