import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { useLoans, type Loan } from "@/hooks/useLoans";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface LoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan?: Loan | null;
}

export function LoanDialog({ open, onOpenChange, loan }: LoanDialogProps) {
  const { beneficiaries } = useBeneficiaries();
  const { addLoan, updateLoan } = useLoans();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    beneficiary_id: loan?.beneficiary_id || "",
    loan_amount: loan?.loan_amount || 0,
    interest_rate: loan?.interest_rate || 0,
    term_months: loan?.term_months || 12,
    start_date: loan?.start_date || format(new Date(), "yyyy-MM-dd"),
    status: loan?.status || "active",
    notes: loan?.notes || "",
  });

  const [startDate, setStartDate] = useState<Date | undefined>(
    loan?.start_date ? new Date(loan.start_date) : new Date()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        ...formData,
        start_date: format(startDate || new Date(), "yyyy-MM-dd"),
        loan_amount: Number(formData.loan_amount),
        interest_rate: Number(formData.interest_rate),
        term_months: Number(formData.term_months),
      };

      if (loan?.id) {
        await updateLoan({ id: loan.id, ...data });
      } else {
        await addLoan(data as any);
      }
      
      onOpenChange(false);
      
      // Reset form
      setFormData({
        beneficiary_id: "",
        loan_amount: 0,
        interest_rate: 0,
        term_months: 12,
        start_date: format(new Date(), "yyyy-MM-dd"),
        status: "active",
        notes: "",
      });
      setStartDate(new Date());
    } catch (error) {
      console.error("Error submitting loan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{loan ? "تعديل قرض" : "إضافة قرض جديد"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="beneficiary">المستفيد *</Label>
            <Select
              value={formData.beneficiary_id}
              onValueChange={(value) =>
                setFormData({ ...formData, beneficiary_id: value })
              }
              disabled={!!loan}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المستفيد" />
              </SelectTrigger>
              <SelectContent>
                {beneficiaries.map((beneficiary) => (
                  <SelectItem key={beneficiary.id} value={beneficiary.id}>
                    {beneficiary.full_name} - {beneficiary.national_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loan_amount">مبلغ القرض (ريال) *</Label>
              <Input
                id="loan_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.loan_amount}
                onChange={(e) =>
                  setFormData({ ...formData, loan_amount: Number(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interest_rate">نسبة الفائدة (%) *</Label>
              <Input
                id="interest_rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.interest_rate}
                onChange={(e) =>
                  setFormData({ ...formData, interest_rate: Number(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="term_months">مدة القرض (شهر) *</Label>
              <Input
                id="term_months"
                type="number"
                min="1"
                value={formData.term_months}
                onChange={(e) =>
                  setFormData({ ...formData, term_months: Number(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>تاريخ البداية *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-right font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "PPP", { locale: ar })
                    ) : (
                      <span>اختر التاريخ</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {loan && (
            <div className="space-y-2">
              <Label htmlFor="status">الحالة</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="paid">مسدد</SelectItem>
                  <SelectItem value="defaulted">متعثر</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

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
              {isLoading ? "جاري الحفظ..." : loan ? "تحديث" : "إضافة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
