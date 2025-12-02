/**
 * نافذة الإقفال التلقائي للسنة المالية
 * Automatic Fiscal Year Closing Dialog
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { supabase } from "@/integrations/supabase/client";
import type { FiscalYear } from "@/hooks/useFiscalYears";
import type { ClosingPreview } from "@/types/fiscal-year-closing";

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
  const { data: preview, isLoading } = useQuery({
    queryKey: ["closing-preview", fiscalYear.id],
    queryFn: async () => {
      // TODO: استدعاء Edge Function للحصول على المعاينة
      // const { data, error } = await supabase.functions.invoke("auto-close-fiscal-year", {
      //   body: { fiscal_year_id: fiscalYear.id, preview_only: true }
      // });
      // if (error) throw error;
      // return data as ClosingPreview;
      
      // مؤقتاً نرجع null
      return null as ClosingPreview | null;
    },
    enabled: open,
  });

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      // TODO: استدعاء Edge Function للتأكيد
      // const { error } = await supabase.functions.invoke("auto-close-fiscal-year", {
      //   body: { fiscal_year_id: fiscalYear.id, preview_only: false }
      // });
      // if (error) throw error;
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error confirming closing:", error);
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

          {!isLoading && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  الإقفال التلقائي قيد التطوير. سيتم إضافة المعاينة التفصيلية قريباً.
                </AlertDescription>
              </Alert>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">ميزات الإقفال التلقائي:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>حساب تلقائي لجميع الإيرادات والمصروفات</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>توزيع الحصص (ناظر، واقف، مستفيدين)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>حساب الضرائب والزكاة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>إنشاء قيد الإقفال تلقائياً</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>حساب رقبة الوقف</span>
                  </li>
                </ul>
              </div>
            </>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button onClick={handleConfirm} disabled={confirming || isLoading}>
              {confirming && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              تأكيد الإقفال التلقائي
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
