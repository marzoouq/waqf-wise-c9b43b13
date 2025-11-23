import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productionLogger } from "@/lib/logger/production-logger";

/**
 * مكون خفي لتشغيل الإصلاح التلقائي دورياً
 */
export function AutoFixExecutor() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // تشغيل الإصلاح التلقائي كل 5 دقائق
    const executeAutoFix = async () => {
      try {
        // 🔒 الحصول على session للمصادقة
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          productionLogger.warn('No session for auto-fix execution');
          return;
        }

        productionLogger.info('Executing auto-fix...');
        
        // ✅ إضافة Authorization header
        const { data, error } = await supabase.functions.invoke('execute-auto-fix', {
          body: {},
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (error) {
          productionLogger.error('Auto-fix error', error, {
            context: 'AutoFixExecutor',
            severity: 'medium',
          });
          return;
        }

        if (data.fixed > 0) {
          productionLogger.success(`Auto-fixed ${data.fixed} errors`);
          toast.success(`تم إصلاح ${data.fixed} خطأ تلقائياً`);
          
          // تحديث البيانات
          queryClient.invalidateQueries({ queryKey: ['system-stats'] });
          queryClient.invalidateQueries({ queryKey: ['recent-errors'] });
          queryClient.invalidateQueries({ queryKey: ['fix-attempts'] });
        }
      } catch (error) {
        productionLogger.error('Failed to execute auto-fix', error, {
          context: 'AutoFixExecutor',
          severity: 'high',
        });
      }
    };

    // تنفيذ فوري عند التحميل
    executeAutoFix();

    // ثم كل 5 دقائق
    const interval = setInterval(executeAutoFix, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return null; // مكون خفي
}
