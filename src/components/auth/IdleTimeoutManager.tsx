import { useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/auth/useUserRole";
import { useIdleTimeout } from "@/hooks/auth/useIdleTimeout";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthService } from "@/services";
import { productionLogger } from "@/lib/logger/production-logger";

/**
 * مكون لإدارة الخروج التلقائي للمستفيدين عند عدم النشاط
 * - يعمل فقط للمستفيدين
 * - مهلة: 5 دقائق
 * - ينظف الحالة تلقائياً عند الخروج
 */
export function IdleTimeoutManager() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { isNazer, isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  // حساب حالة التفعيل
  const isReady = !authLoading && !roleLoading;
  const shouldEnable = isReady && !!user && !isNazer && !isAdmin;

  // الخروج التلقائي وتنظيف الحالة
  const handleIdleLogout = useCallback(async () => {
    productionLogger.info('خروج تلقائي بسبب عدم النشاط');

    toast.warning("تم تسجيل خروجك تلقائياً", {
      description: "لم يتم اكتشاف أي نشاط لمدة 5 دقائق",
      duration: 5000,
    });

    try {
      // تنظيف localStorage
      const keysToKeep = ['theme'];
      Object.keys(localStorage).forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      sessionStorage.clear();
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      productionLogger.warn('تحذير أثناء الخروج التلقائي - تم التجاوز', { error });
      await AuthService.logout();
      navigate('/login', { replace: true });
    }
  }, [signOut, navigate]);

  // تفعيل نظام الخروج التلقائي - يجب استدعاؤه دائماً (قبل أي return)
  useIdleTimeout({
    onIdle: handleIdleLogout,
    idleTime: 5 * 60 * 1000,
    enabled: shouldEnable,
  });

  // تنظيف إضافي عند فك التحميل
  useEffect(() => {
    return () => {
      // تنظيف صامت
    };
  }, []);

  return null;
}
