/**
 * Hook لإجراءات صحة النظام
 */

import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";
import { toast } from "sonner";

export function useSystemHealthActions(refetch: () => void) {
  // حل جميع التنبيهات القديمة
  const handleBulkResolve = async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from("system_alerts")
        .update({ 
          status: "resolved", 
          resolved_at: new Date().toISOString() 
        })
        .eq("status", "active")
        .lt("created_at", oneDayAgo);

      if (error) throw error;

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
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from("system_error_logs")
        .delete()
        .in("status", ["resolved", "auto_resolved"])
        .lt("resolved_at", oneWeekAgo);

      if (error) throw error;

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
      
      const { data, error } = await supabase.functions.invoke('execute-auto-fix', {
        body: { manual: true }
      });

      if (error) throw error;

      toast.success(`تم التنظيف بنجاح! تم إصلاح ${data?.fixed || 0} مشكلة`);
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
