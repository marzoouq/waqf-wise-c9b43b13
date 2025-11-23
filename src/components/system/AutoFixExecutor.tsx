import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productionLogger } from "@/lib/logger/production-logger";

/**
 * مكون خفي لتشغيل الإصلاح التلقائي دورياً
 * يعمل فقط للمستخدمين الذين لديهم صلاحيات admin أو nazer
 */
export function AutoFixExecutor() {
  const queryClient = useQueryClient();
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  // التحقق من الصلاحيات عند التحميل
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setHasPermission(false);
          return;
        }

        // فحص الأدوار
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const userRoles = roles?.map(r => r.role) || [];
        const isAuthorized = userRoles.includes('admin') || userRoles.includes('nazer');
        
        setHasPermission(isAuthorized);
        
        if (!isAuthorized) {
          productionLogger.info('AutoFixExecutor disabled: user does not have admin/nazer role');
        }
      } catch (error) {
        productionLogger.error('Failed to check permissions for auto-fix', error);
        setHasPermission(false);
      }
    };

    checkPermissions();
  }, []);

  useEffect(() => {
    // لا تشغل الـ auto-fix إذا لم يكن لدى المستخدم صلاحيات
    if (!hasPermission) {
      return;
    }

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
  }, [queryClient, hasPermission]);

  return null; // مكون خفي
}
