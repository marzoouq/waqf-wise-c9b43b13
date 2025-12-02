/**
 * نافذة الإقفال اليدوي للسنة المالية
 * Manual Fiscal Year Closing Dialog
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import type { FiscalYear } from "@/hooks/useFiscalYears";

interface ManualClosingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fiscalYear: FiscalYear;
}

export function ManualClosingDialog({
  open,
  onOpenChange,
  fiscalYear,
}: ManualClosingDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إقفال يدوي للسنة المالية: {fiscalYear.name}</DialogTitle>
          <DialogDescription>
            إقفال يدوي مع التحكم الكامل في كل خطوة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* مؤشر الخطوات */}
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 ${
                  step < currentStep
                    ? "border-primary"
                    : step === currentStep
                    ? "border-primary"
                    : "border-muted"
                } ${step !== 4 ? "border-l-2" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                    step <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step}
                </div>
                <p className="text-xs text-center mt-2">
                  {step === 1 && "مراجعة"}
                  {step === 2 && "قيد الإقفال"}
                  {step === 3 && "رقبة الوقف"}
                  {step === 4 && "تأكيد"}
                </p>
              </div>
            ))}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              الإقفال اليدوي قيد التطوير. سيتم إضافة الخطوات التفصيلية قريباً.
            </AlertDescription>
          </Alert>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  السابق
                </Button>
              )}
              {currentStep < 4 && (
                <Button onClick={() => setCurrentStep(currentStep + 1)}>
                  التالي
                </Button>
              )}
              {currentStep === 4 && (
                <Button disabled={loading}>
                  {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  تأكيد الإقفال
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
