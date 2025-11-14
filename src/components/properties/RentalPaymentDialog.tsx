import { useState, useEffect } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRentalPayments, RentalPayment } from "@/hooks/useRentalPayments";
import { useContracts } from "@/hooks/useContracts";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: RentalPayment | null;
  contractId?: string;
}

export const RentalPaymentDialog = ({ open, onOpenChange, payment, contractId }: Props) => {
  const { addPayment, updatePayment } = useRentalPayments();
  const { contracts } = useContracts();

  const [formData, setFormData] = useState({
    contract_id: contractId || "",
    due_date: "",
    amount_due: "",
    amount_paid: "",
    payment_method: "",
    discount: "",
    receipt_number: "",
    notes: "",
  });

  useEffect(() => {
    if (payment) {
      setFormData({
        contract_id: payment.contract_id,
        due_date: payment.due_date,
        amount_due: payment.amount_due.toString(),
        amount_paid: payment.amount_paid.toString(),
        payment_method: payment.payment_method || "",
        discount: payment.discount.toString(),
        receipt_number: payment.receipt_number || "",
        notes: payment.notes || "",
      });
    } else if (contractId) {
      setFormData(prev => ({ ...prev, contract_id: contractId }));
    }
  }, [payment, contractId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const paymentData = {
      ...formData,
      amount_due: parseFloat(formData.amount_due),
      amount_paid: parseFloat(formData.amount_paid) || 0,
      discount: parseFloat(formData.discount) || 0,
    };

    if (payment) {
      updatePayment.mutate({ id: payment.id, ...paymentData });
    } else {
      addPayment.mutate(paymentData);
    }
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      contract_id: contractId || "",
      due_date: "",
      amount_due: "",
      amount_paid: "",
      payment_method: "",
      discount: "",
      receipt_number: "",
      notes: "",
    });
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={payment ? "تعديل دفعة" : "إضافة دفعة جديدة"}
      description={payment ? "تعديل بيانات الدفعة" : "أدخل بيانات الدفعة الجديدة"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
          {!contractId && (
            <div className="space-y-2">
              <Label>العقد *</Label>
              <Select
                value={formData.contract_id}
                onValueChange={(value) => setFormData({ ...formData, contract_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر العقد" />
                </SelectTrigger>
                <SelectContent>
                  {contracts?.filter(c => c.status === 'نشط').map((contract) => (
                    <SelectItem key={contract.id} value={contract.id}>
                      {contract.contract_number} - {contract.tenant_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>تاريخ الاستحقاق *</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>المبلغ المستحق *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount_due}
                onChange={(e) => setFormData({ ...formData, amount_due: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>المبلغ المدفوع</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount_paid}
                onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>الخصم</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>طريقة الدفع</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="نقدي">نقدي</SelectItem>
                  <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                  <SelectItem value="شيك">شيك</SelectItem>
                  <SelectItem value="بطاقة">بطاقة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>رقم الإيصال</Label>
              <Input
                value={formData.receipt_number}
                onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit">
              {payment ? "تحديث" : "إضافة"}
            </Button>
          </div>
        </form>
    </ResponsiveDialog>
  );
};