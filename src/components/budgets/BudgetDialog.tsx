import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveDialog, DialogFooter } from "@/components/shared/ResponsiveDialog";
import { Budget } from "@/hooks/useBudgets";
import { useAccounts } from "@/hooks/useAccounts";
import { useFiscalYears } from "@/hooks/useFiscalYears";
import { Database } from "@/integrations/supabase/types";

type BudgetInsert = Database['public']['Tables']['budgets']['Insert'];

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget | null;
  onSave: (data: BudgetInsert | (BudgetInsert & { id: string })) => Promise<void>;
}

export function BudgetDialog({ open, onOpenChange, budget, onSave }: BudgetDialogProps) {
  const { accounts } = useAccounts();
  const { fiscalYears } = useFiscalYears();
  const [formData, setFormData] = useState({
    account_id: "",
    fiscal_year_id: "",
    period_type: "شهري",
    period_number: 1,
    budgeted_amount: 0,
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        account_id: budget.account_id,
        fiscal_year_id: budget.fiscal_year_id,
        period_type: budget.period_type,
        period_number: budget.period_number || 1,
        budgeted_amount: budget.budgeted_amount,
      });
    } else {
      // اختيار السنة المالية النشطة افتراضياً
      const activeFiscalYear = fiscalYears.find(fy => fy.is_active);
      setFormData({
        account_id: "",
        fiscal_year_id: activeFiscalYear?.id || "",
        period_type: "شهري",
        period_number: 1,
        budgeted_amount: 0,
      });
    }
  }, [budget, fiscalYears]);

  const handleSubmit = async () => {
    await onSave(budget ? { id: budget.id, ...formData } : formData);
    onOpenChange(false);
  };

  // تصفية الحسابات (فقط حسابات المصروفات والإيرادات)
  const budgetableAccounts = accounts.filter(
    acc => !acc.is_header && (acc.account_type === 'expense' || acc.account_type === 'revenue')
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={budget ? "تعديل ميزانية" : "إضافة ميزانية جديدة"}
      size="lg"
    >
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fiscal_year">السنة المالية</Label>
            <Select
              value={formData.fiscal_year_id}
              onValueChange={(value) => setFormData({ ...formData, fiscal_year_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر السنة المالية" />
              </SelectTrigger>
              <SelectContent>
                {fiscalYears.map((fy) => (
                  <SelectItem key={fy.id} value={fy.id}>
                    {fy.name} {fy.is_active && "(نشطة)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account">الحساب</Label>
            <Select
              value={formData.account_id}
              onValueChange={(value) => setFormData({ ...formData, account_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الحساب" />
              </SelectTrigger>
              <SelectContent>
                {budgetableAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.code} - {account.name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="period_type">نوع الفترة</Label>
            <Select
              value={formData.period_type}
              onValueChange={(value) => setFormData({ ...formData, period_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="شهري">شهري</SelectItem>
                <SelectItem value="ربع سنوي">ربع سنوي</SelectItem>
                <SelectItem value="سنوي">سنوي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period_number">رقم الفترة</Label>
            <Input
              id="period_number"
              type="number"
              min="1"
              max={formData.period_type === "شهري" ? 12 : formData.period_type === "ربع سنوي" ? 4 : 1}
              value={formData.period_number}
              onChange={(e) =>
                setFormData({ ...formData, period_number: parseInt(e.target.value) || 1 })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budgeted_amount">المبلغ المقدّر</Label>
          <Input
            id="budgeted_amount"
            type="number"
            step="0.01"
            value={formData.budgeted_amount}
            onChange={(e) =>
              setFormData({ ...formData, budgeted_amount: parseFloat(e.target.value) || 0 })
            }
            placeholder="0.00"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          إلغاء
        </Button>
        <Button onClick={handleSubmit}>
          {budget ? "تحديث" : "إضافة"}
        </Button>
      </DialogFooter>
    </ResponsiveDialog>
  );
}
