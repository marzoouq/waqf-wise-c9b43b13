/**
 * DistributeRevenueDialog
 * محاورة توزيع غلة الوقف - مُعاد هيكلتها
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Coins, CheckCircle2 } from "lucide-react";
import {
  DistributeInputSection,
  DistributePreviewSection,
  useDistributeRevenue,
} from "./distribute";

interface DistributeRevenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DistributeRevenueDialog({
  open,
  onOpenChange,
}: DistributeRevenueDialogProps) {
  const {
    totalAmount,
    setTotalAmount,
    selectedFiscalYear,
    setSelectedFiscalYear,
    distributionDate,
    setDistributionDate,
    notes,
    setNotes,
    notifyHeirs,
    setNotifyHeirs,
    previewShares,
    isPreviewMode,
    setIsPreviewMode,
    activeFiscalYears,
    calculatePreview,
    executeDistribution,
    isExecuting,
  } = useDistributeRevenue(() => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            توزيع غلة الوقف
          </DialogTitle>
          <DialogDescription>
            توزيع الغلة على الورثة حسب الشريعة الإسلامية (للذكر مثل حظ الأنثيين)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] px-1">
          <div className="space-y-6">
            {!isPreviewMode ? (
              <DistributeInputSection
                totalAmount={totalAmount}
                setTotalAmount={setTotalAmount}
                selectedFiscalYear={selectedFiscalYear}
                setSelectedFiscalYear={setSelectedFiscalYear}
                distributionDate={distributionDate}
                setDistributionDate={setDistributionDate}
                notes={notes}
                setNotes={setNotes}
                notifyHeirs={notifyHeirs}
                setNotifyHeirs={setNotifyHeirs}
                activeFiscalYears={activeFiscalYears}
              />
            ) : (
              <DistributePreviewSection previewShares={previewShares} />
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          {isPreviewMode ? (
            <>
              <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
                تعديل
              </Button>
              <Button
                onClick={executeDistribution}
                disabled={isExecuting}
                className="gap-2"
              >
                {isExecuting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                اعتماد التوزيع
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button
                onClick={calculatePreview}
                disabled={!totalAmount || !selectedFiscalYear}
              >
                معاينة التوزيع
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
