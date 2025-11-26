import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
    console.log('🔴 خروج تلقائي بسبب عدم النشاط');

    // عرض إشعار
    toast.warning("تم تسجيل خروجك تلقائياً", {
      description: "لم يتم اكتشاف أي نشاط لمدة دقيقة",
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

      console.log('✅ تم تنظيف الحالة والخروج بنجاح');
    } catch (error) {
      console.error('❌ خطأ أثناء الخروج التلقائي:', error);
      
      // محاولة الخروج على مستوى Supabase مباشرة
      await supabase.auth.signOut();
      navigate('/login', { replace: true });
    }
  };

  // تفعيل نظام الخروج التلقائي
  const { resetTimer } = useIdleTimeout({
    onIdle: handleIdleLogout,
    idleTime: 60 * 1000, // دقيقة واحدة
    enabled: !roleLoading && !!user && !isNazer && !isAdmin, // لجميع المستخدمين عدا الناظر والمشرف
  });

  // تنظيف إضافي عند فك التحميل (unmount)
  useEffect(() => {
    return () => {
      if (user && !isNazer && !isAdmin) {
        console.log('🧹 تنظيف مكون IdleTimeoutManager');
      }
    };
  }, [isNazer, isAdmin, user]);

  // رسالة تأكيد عند تفعيل النظام
  useEffect(() => {
    if (!roleLoading && user && !isNazer && !isAdmin) {
      console.log(`
╔══════════════════════════════════════════════╗
║  ⏰ نظام الخروج التلقائي مفعّل              ║
╚══════════════════════════════════════════════╝

👤 نوع المستخدم: عام (باستثناء الناظر والمشرف)
⏱️  المهلة: 60 ثانية من عدم النشاط
🔄 التنظيف: تلقائي عند الخروج
      `);
    }
  }, [roleLoading, user, isNazer, isAdmin]);

  // المكون لا يعرض أي UI
  return null;
}
