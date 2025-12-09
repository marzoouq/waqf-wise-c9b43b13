/**
 * نافذة الإقفال التلقائي للسنة المالية
 * Automatic Fiscal Year Closing Dialog
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
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { EdgeFunctionService } from "@/services";
import { toast } from "sonner";
import type { FiscalYear } from "@/hooks/useFiscalYears";
import { FiscalYearClosingStats } from "./FiscalYearClosingStats";
import { formatCurrency } from "@/lib/utils";
import { useClosingPreview } from "@/hooks/fiscal-years/useFiscalYearData";

interface AutomaticClosingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fiscalYear: FiscalYear;
}

export function AutomaticClosingDialog({
  open,
  onOpenChange,
  fiscalYear,
}: AutomaticClosingDialogProps) {
  const [confirming, setConfirming] = useState(false);

  // الحصول على معاينة الإقفال التلقائي
  const { data: preview, isLoading } = useClosingPreview(fiscalYear.id, open);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const result = await EdgeFunctionService.invokeAutoCloseFiscalYear({
        fiscalYearId: fiscalYear.id,
        preview: false
      });
      
      if (!result.success) throw new Error(result.error);
      
      if (result.data?.success) {
        toast.success("تم إقفال السنة المالية بنجاح");
        onOpenChange(false);
      } else {
        throw new Error(result.data?.error || "فشل الإقفال");
      }
    } catch (error) {
      console.error("Error confirming closing:", error);
      toast.error("حدث خطأ أثناء إقفال السنة المالية");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إقفال تلقائي للسنة المالية: {fiscalYear.name}</DialogTitle>
          <DialogDescription>
            معاينة الإقفال التلقائي قبل التأكيد النهائي
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="mr-3">جاري حساب الإقفال التلقائي...</span>
            </div>
          )}

          {!isLoading && preview && (
            <>
              {preview.warnings && preview.warnings.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc mr-4">
                      {preview.warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-6">
                <FiscalYearClosingStats
                  totalRevenues={preview.summary.total_revenues}
                  totalExpenses={preview.summary.total_expenses}
                  netIncome={preview.summary.net_income}
                  waqfCorpus={preview.waqf_corpus}
                  nazerShare={preview.summary.nazer_share}
                  waqifShare={preview.summary.waqif_share}
                />

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">قيد الإقفال المقترح:</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">رقم القيد:</span>
                      <span className="font-medium">{preview.closing_entry.entry_number}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">التاريخ:</span>
                      <span className="font-medium">{preview.closing_entry.entry_date}</span>
                    </div>
                  </div>

                  <div className="mt-4 border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-right p-2">الحساب</th>
                          <th className="text-right p-2">مدين</th>
                          <th className="text-right p-2">دائن</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.closing_entry.lines.map((line, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="p-2">{line.account_name}</td>
                            <td className="p-2 text-green-600">
                              {line.debit_amount > 0 ? formatCurrency(line.debit_amount) : '-'}
                            </td>
                            <td className="p-2 text-red-600">
                              {line.credit_amount > 0 ? formatCurrency(line.credit_amount) : '-'}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t font-bold bg-muted/50">
                          <td className="p-2">الإجمالي</td>
                          <td className="p-2 text-green-600">
                            {formatCurrency(preview.closing_entry.total_debit)}
                          </td>
                          <td className="p-2 text-red-600">
                            {formatCurrency(preview.closing_entry.total_credit)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {preview.can_close ? (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      جميع الفحوصات تمت بنجاح. يمكنك الآن تأكيد الإقفال.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      لا يمكن إقفال السنة المالية حالياً. يرجى مراجعة التحذيرات أعلاه.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={confirming || isLoading || !preview?.can_close}
            >
              {confirming && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              تأكيد الإقفال التلقائي
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
