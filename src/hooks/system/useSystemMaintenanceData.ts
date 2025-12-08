/**
 * Hook for SystemMaintenance data and operations
 * يدير عمليات صيانة النظام
 */

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { productionLogger } from "@/lib/logger/production-logger";
import { MonitoringService } from "@/services";

export interface BackfillResult {
  success: boolean;
  message?: string;
  processed?: number;
  failed?: number;
  cleaned_entries?: number;
  processed_payments?: Array<{ payment_number: string }>;
  errors?: string[];
}

export function useSystemMaintenanceData() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BackfillResult | null>(null);

  const handleBackfillDocuments = async () => {
    try {
      setIsProcessing(true);
      setResult(null);

      toast({
        title: "⏳ جاري المعالجة...",
        description: "يتم الآن معالجة الدفعات المدفوعة وإنشاء المستندات المفقودة",
      });

      const data = await MonitoringService.backfillDocuments();
      setResult(data);

      if (data.success) {
        toast({
          title: "✅ تمت المعالجة بنجاح",
          description: data.message,
        });
      } else {
        toast({
          title: "⚠️ تحذير",
          description: data.message || "حدثت بعض المشاكل أثناء المعالجة",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      productionLogger.error('Error calling backfill function:', error);
      const errorMessage = error instanceof Error ? error.message : "فشل في معالجة المستندات";
      toast({
        title: "❌ خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    result,
    handleBackfillDocuments,
  };
}
