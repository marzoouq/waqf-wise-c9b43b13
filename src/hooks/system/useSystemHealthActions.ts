/**
 * Hook لإجراءات صحة النظام
 * @version 2.8.67
 */

import { SystemService, EdgeFunctionService } from "@/services";
import { productionLogger } from "@/lib/logger/production-logger";
import { toast } from "sonner";

export function useSystemHealthActions(refetch: () => void) {
  // حل جميع التنبيهات القديمة
  const handleBulkResolve = async () => {
    try {
      await SystemService.bulkResolveOldAlerts();
      toast.success("تم حل جميع التنبيهات القديمة بنجاح");
      refetch();
    } catch (error) {
      toast.error("فشل في حل التنبيهات");
      productionLogger.error("فشل في حل التنبيهات:", error);
    }
  };

  // مسح الأخطاء المحلولة القديمة
  const handleCleanupResolved = async () => {
    try {
      await SystemService.cleanupResolvedErrors();
      toast.success("تم مسح الأخطاء القديمة بنجاح");
      refetch();
    } catch (error) {
      toast.error("فشل في مسح الأخطاء");
      productionLogger.error("فشل في مسح الأخطاء:", error);
    }
  };

  // تنظيف فوري يدوي
  const handleManualCleanup = async () => {
    try {
      toast.info("جاري تنفيذ التنظيف الفوري...");
      
      const result = await EdgeFunctionService.invoke<{ fixed?: number }>('execute-auto-fix', {
        manual: true
      });

      if (!result.success) throw new Error(result.error);

      toast.success(`تم التنظيف بنجاح! تم إصلاح ${result.data?.fixed || 0} مشكلة`);
      refetch();
    } catch (error) {
      toast.error("فشل التنظيف الفوري");
      productionLogger.error("فشل التنظيف الفوري:", error);
    }
  };

  return {
    handleBulkResolve,
    handleCleanupResolved,
    handleManualCleanup,
  };
}
