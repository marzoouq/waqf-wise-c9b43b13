/**
 * نافذة إضافة سنة مالية جديدة/تاريخية
 * Add Fiscal Year Dialog
 */

import { useState } from "react";
import { useCreateFiscalYear } from "@/hooks/fiscal-years/useCreateFiscalYear";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CalendarIcon, Archive, Save, Loader2 } from "lucide-react";

interface AddFiscalYearDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FiscalYearFormData {
  name: string;
  start_date: string;
  end_date: string;
  is_historical: boolean;
  // بيانات الإقفال للسنوات التاريخية
  total_revenues: number;
  total_expenses: number;
  nazer_share: number;
  waqif_share: number;
  beneficiary_distributions: number;
  waqf_corpus: number;
  notes: string;
}

export function AddFiscalYearDialog({ open, onOpenChange }: AddFiscalYearDialogProps) {
  const [formData, setFormData] = useState<FiscalYearFormData>({
    name: "",
    start_date: "",
    end_date: "",
    is_historical: true,
    total_revenues: 0,
    total_expenses: 0,
    nazer_share: 0,
    waqif_share: 0,
    beneficiary_distributions: 0,
    waqf_corpus: 0,
    notes: "",
  });

  const netIncome = formData.total_revenues - formData.total_expenses;

  // استخدام الـ hook بدلاً من useMutation مباشرة
  const { createFiscalYear, isCreating } = useCreateFiscalYear(() => {
    onOpenChange(false);
    resetForm();
  });

  const resetForm = () => {
    setFormData({
      name: "",
      start_date: "",
      end_date: "",
      is_historical: true,
      total_revenues: 0,
      total_expenses: 0,
      nazer_share: 0,
      waqif_share: 0,
      beneficiary_distributions: 0,
      waqf_corpus: 0,
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    createFiscalYear(formData);
  };

  const updateField = (field: keyof FiscalYearFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            إضافة سنة مالية جديدة
          </DialogTitle>
          <DialogDescription>
            أضف سنة مالية جديدة أو سنة تاريخية سابقة مع بياناتها المالية
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* البيانات الأساسية */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم السنة المالية *</Label>
              <Input
                id="name"
                placeholder="مثال: السنة المالية 2023-2024"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">تاريخ البداية *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateField("start_date", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">تاريخ النهاية *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => updateField("end_date", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Archive className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="is_historical" className="cursor-pointer">
                    سنة تاريخية (إقفال مباشر)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    تفعيل هذا الخيار يتيح إدخال بيانات الإقفال مباشرة
                  </p>
                </div>
              </div>
              <Switch
                id="is_historical"
                checked={formData.is_historical}
                onCheckedChange={(checked) => updateField("is_historical", checked)}
              />
            </div>
          </div>

          {/* بيانات الإقفال للسنوات التاريخية */}
          {formData.is_historical && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  بيانات الإقفال المالي
                </h3>

                {/* الإيرادات والمصروفات */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_revenues">إجمالي الإيرادات</Label>
                    <Input
                      id="total_revenues"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.total_revenues || ""}
                      onChange={(e) => updateField("total_revenues", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total_expenses">إجمالي المصروفات</Label>
                    <Input
                      id="total_expenses"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.total_expenses || ""}
                      onChange={(e) => updateField("total_expenses", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* صافي الدخل (محسوب تلقائياً) */}
                <div className="p-3 bg-primary/5 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">صافي الدخل (محسوب):</span>
                    <span className={`font-bold ${netIncome >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {netIncome.toLocaleString('ar-SA')} ر.س
                    </span>
                  </div>
                </div>

                {/* الحصص والتوزيعات */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nazer_share">حصة الناظر (10%)</Label>
                    <Input
                      id="nazer_share"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.nazer_share || ""}
                      onChange={(e) => updateField("nazer_share", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waqif_share">حصة الواقف (5%)</Label>
                    <Input
                      id="waqif_share"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.waqif_share || ""}
                      onChange={(e) => updateField("waqif_share", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="beneficiary_distributions">توزيعات الورثة</Label>
                    <Input
                      id="beneficiary_distributions"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.beneficiary_distributions || ""}
                      onChange={(e) => updateField("beneficiary_distributions", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waqf_corpus">رقبة الوقف (الفائض)</Label>
                    <Input
                      id="waqf_corpus"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.waqf_corpus || ""}
                      onChange={(e) => updateField("waqf_corpus", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* ملاحظات */}
                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    placeholder="أي ملاحظات إضافية عن السنة المالية..."
                    value={formData.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ms-2" />
                  حفظ السنة المالية
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
