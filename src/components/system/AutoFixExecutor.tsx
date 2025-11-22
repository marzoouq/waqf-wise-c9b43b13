import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * مكون خفي لتشغيل الإصلاح التلقائي دورياً
 */
export function AutoFixExecutor() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // تشغيل الإصلاح التلقائي كل 5 دقائق
    const executeAutoFix = async () => {
      try {
        console.log('🔧 Executing auto-fix...');
        
        const { data, error } = await supabase.functions.invoke('execute-auto-fix', {
          body: {},
        });

        if (error) {
          console.error('Auto-fix error:', error);
          return;
        }

        if (data.fixed > 0) {
          console.log(`✅ Auto-fixed ${data.fixed} errors`);
          toast.success(`تم إصلاح ${data.fixed} خطأ تلقائياً`);
          
          // تحديث البيانات
          queryClient.invalidateQueries({ queryKey: ['system-stats'] });
          queryClient.invalidateQueries({ queryKey: ['recent-errors'] });
          queryClient.invalidateQueries({ queryKey: ['fix-attempts'] });
        }
      } catch (error) {
        console.error('Failed to execute auto-fix:', error);
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
