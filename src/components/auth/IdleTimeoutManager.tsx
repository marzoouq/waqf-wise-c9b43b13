import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";

/**
 * مكون لإدارة الخروج التلقائي للمستفيدين عند عدم النشاط
 * - يعمل فقط للمستفيدين
 * - مهلة: دقيقة واحدة (60 ثانية)
 * - ينظف الحالة تلقائياً عند الخروج
 */
export function IdleTimeoutManager() {
  const { user, signOut } = useAuth();
  const { isNazer, isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  // الخروج التلقائي وتنظيف الحالة
  const handleIdleLogout = async () => {
    productionLogger.info('خروج تلقائي بسبب عدم النشاط');

    // عرض إشعار
    toast.warning("تم تسجيل خروجك تلقائياً", {
      description: "لم يتم اكتشاف أي نشاط لمدة 5 دقائق",
      duration: 5000,
    });

    try {
      // تنظيف localStorage
      const keysToKeep = ['theme']; // الاحتفاظ بإعدادات الثيم
      Object.keys(localStorage).forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      // تنظيف sessionStorage
      sessionStorage.clear();

      // تسجيل الخروج
      await signOut();

      // إعادة التوجيه لصفحة تسجيل الدخول
      navigate('/login', { replace: true });
    } catch (error) {
      productionLogger.error('خطأ أثناء الخروج التلقائي', error);
      
      // محاولة الخروج على مستوى Supabase مباشرة
      await supabase.auth.signOut();
      navigate('/login', { replace: true });
    }
  };

  // تفعيل نظام الخروج التلقائي
  const { resetTimer } = useIdleTimeout({
    onIdle: handleIdleLogout,
    idleTime: 5 * 60 * 1000, // 5 دقائق
    enabled: !roleLoading && !!user && !isNazer && !isAdmin, // لجميع المستخدمين عدا الناظر والمشرف
  });

  // تنظيف إضافي عند فك التحميل (unmount)
  useEffect(() => {
    return () => {
      // تنظيف صامت
    };
  }, [isNazer, isAdmin, user]);

  // المكون لا يعرض أي UI
  return null;
}
